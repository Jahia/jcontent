import {JContent} from '../../../page-object';
import gql from 'graphql-tag';

/**
 * Placing an image's focal point, and what ends up in the repository.
 *
 * focalPoint.utils.spec.js covers the arithmetic. What only a run can show is the round trip: that
 * the point an editor clicks is the point that gets stored, that reopening shows it again, and that
 * resetting takes the mixin back off - the CND comments on jmix:focalPoint promise that last part
 * and nothing verified it.
 */

const mediaReadyToUpload = () => {
    cy.get('.moonstone-loader', {timeout: 30000}).should('not.exist');
    cy.get('button[data-sel-role="fileUpload"]', {timeout: 30000}).should('be.visible');
};

/** The dialog renders 25 where the DOUBLE property reads back as "25.0", so compare the numbers */
const numbersIn = (text: string) => (text.match(/[\d.]+/g) || []).map(Number);

const focalPointOf = (path: string) => cy.apollo({
    query: gql`query {
        jcr {
            nodeByPath(path: "${path}") {
                mixinTypes { name }
                focalX: property(name: "j:focalX") { value }
                focalY: property(name: "j:focalY") { value }
            }
        }
    }`,
    errorPolicy: 'all',
    fetchPolicy: 'no-cache'
}).then(({data}) => {
    const node = data?.jcr?.nodeByPath;
    return {
        hasMixin: Boolean(node?.mixinTypes?.some((m: {name: string}) => m.name === 'jmix:focalPoint')),
        x: node?.focalX?.value ?? null,
        y: node?.focalY?.value ?? null
    };
});

describe('Focal point', () => {
    const siteKey = 'focalPointSite';
    const image = 'myfile.png';
    const notAnImage = 'myfile.txt';
    const pathTo = (name: string) => `/sites/${siteKey}/files/${name}`;

    before(function () {
        cy.executeGroovy('jcontent/createSite.groovy', {SITEKEY: siteKey});
        cy.loginAndStoreSession();

        const media = JContent.visit(siteKey, 'en', 'media/files').getMedia().open();
        // Waited for before each upload, not once for both: the upload panel of the first is still
        // on screen when the second starts, and its success marker is what the helper waits on.
        mediaReadyToUpload();
        media.uploadFileViaDialog(image, 'assets/uploadMedia');
        mediaReadyToUpload();
        media.uploadFileViaDialog(notAnImage, 'assets/uploadMedia');
    });

    beforeEach(() => {
        cy.loginAndStoreSession();
    });

    after(function () {
        cy.logout();
        cy.executeGroovy('jcontent/deleteSite.groovy', {SITEKEY: siteKey});
    });

    const openMenuOn = (fileName: string) => JContent.visit(siteKey, 'en', 'media/files')
        .switchToListMode()
        .getTable()
        .getRowByName(fileName)
        .contextMenu();

    const openDialogOn = (fileName: string) => {
        openMenuOn(fileName).select('Set focal point');
        cy.get('[data-sel-role="focal-point-image"]', {timeout: 30000}).should('be.visible');
    };

    /**
     * The dialog closes only once its mutation has resolved, so waiting for it to go is what makes
     * the repository safe to read. Clicking the button and reading straight away races the save.
     */
    const closeWith = (role: string) => {
        cy.get(`[data-sel-role="${role}"]`).click();
        cy.get('[data-sel-role="focal-point-image"]', {timeout: 30000}).should('not.exist');
    };

    /** Clicks the image at the given fraction of its own box, and returns what the dialog then shows */
    const clickAt = (fx: number, fy: number) => {
        cy.get('[data-sel-role="focal-point-image"]').then($img => {
            const w = $img.width() as number;
            const h = $img.height() as number;
            cy.wrap($img).click(Math.round(w * fx), Math.round(h * fy));
        });
        return cy.get('[data-sel-role="focal-point-value"]').invoke('text');
    };

    it('offers the action on an image', function () {
        openMenuOn(image).shouldHaveItem('Set focal point');
    });

    it('does not offer the action on a file that is not an image', function () {
        openMenuOn(notAnImage).shouldNotHaveItem('Set focal point');
    });

    it('stores the point the editor clicked, and stores what it displayed', function () {
        openDialogOn(image);

        clickAt(0.25, 0.75).then(shown => {
            closeWith('focal-point-save');

            focalPointOf(pathTo(image)).then(stored => {
                expect(stored.hasMixin, 'jmix:focalPoint applied').to.be.true;

                // The dialog's own claim is that the marker sits where the value will be stored, so
                // assert against what it displayed rather than against the click arithmetic - that
                // is the promise a reader of this feature relies on.
                const [shownX, shownY] = numbersIn(shown);
                expect(shownX, 'displayed x matches stored').to.equal(Number(stored.x));
                expect(shownY, 'displayed y matches stored').to.equal(Number(stored.y));

                // And loosely against where the click landed, so a dialog that displayed and stored
                // the same wrong number still fails.
                expect(Number(stored.x), 'x near 25').to.be.closeTo(25, 2);
                expect(Number(stored.y), 'y near 75').to.be.closeTo(75, 2);
            });
        });
    });

    it('shows the stored point again when reopened', function () {
        focalPointOf(pathTo(image)).then(stored => {
            openDialogOn(image);
            // Existence rather than visibility: the marker is positioned over the image and Cypress
            // reports it as covered, which says nothing about whether the point was restored.
            cy.get('[data-sel-role="focal-point-marker"]').should('exist');
            cy.get('[data-sel-role="focal-point-value"]').invoke('text').then(text => {
                const [x, y] = numbersIn(text);
                expect(x, 'x restored').to.equal(Number(stored.x));
                expect(y, 'y restored').to.equal(Number(stored.y));
            });
            closeWith('focal-point-cancel');
        });
    });

    it('leaves the stored point alone when cancelled', function () {
        focalPointOf(pathTo(image)).then(before => {
            openDialogOn(image);
            clickAt(0.9, 0.1);
            closeWith('focal-point-cancel');

            focalPointOf(pathTo(image)).then(after => {
                expect(after.x, 'x unchanged').to.equal(before.x);
                expect(after.y, 'y unchanged').to.equal(before.y);
            });
        });
    });

    it('takes the mixin back off on reset, rather than storing the centre', function () {
        // Sets its own point first: asserting the mixin is absent proves nothing unless something
        // put it there, and an earlier test failing would otherwise make this one pass anyway.
        openDialogOn(image);
        clickAt(0.4, 0.6);
        closeWith('focal-point-save');
        focalPointOf(pathTo(image)).then(saved => {
            expect(saved.hasMixin, 'precondition: a point is stored').to.be.true;
        });

        openDialogOn(image);
        closeWith('focal-point-reset');

        focalPointOf(pathTo(image)).then(stored => {
            // An absent point means the centre, so reset removes rather than writes 50/50. Leaving
            // the mixin behind would be invisible in the UI and wrong in the repository.
            expect(stored.hasMixin, 'jmix:focalPoint removed').to.be.false;
            expect(stored.x, 'j:focalX deleted').to.be.null;
            expect(stored.y, 'j:focalY deleted').to.be.null;
        });
    });

    it('disables reset while the point is already at the centre', function () {
        // Reset is meaningless with nothing stored - the previous test left it that way.
        openDialogOn(image);
        cy.get('[data-sel-role="focal-point-reset"]').should('be.disabled');
        closeWith('focal-point-cancel');
    });
});
