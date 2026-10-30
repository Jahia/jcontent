import {addNode, context, createSite, uploadFile} from '@jahia/cypress';
import {JContent} from '../../../page-object';

const siteKey = 'contentManagerKeyboardNavigation';
const folder = 'keyboard-navigation';
const folderPath = `/sites/${siteKey}/files/${folder}`;
const imageNames = Array.from({length: 12}, (_, i) => `navigation-${String(i + 1).padStart(2, '0')}.png`);

const removeFixtures = () => {
    cy.executeGroovy('jcontent/deleteSite.groovy', {SITEKEY: siteKey});
};

const previewName = () => cy.get('[data-sel-role="side-panel"] [data-cm-role="preview-name"]');

// A click in the list focuses the container that listens to the keys, which carries no selector
const press = (key: 'rightarrow' | 'downarrow' | 'uparrow' | 'leftarrow') => {
    cy.focused().type(`{${key}}`);
};

describe('Keyboard navigation of the preview', () => {
    before(() => {
        removeFixtures();

        createSite(siteKey, {templateSet: 'dx-base-demo-templates', serverName: 'localhost', locale: 'en'});
        addNode({parentPathOrId: `/sites/${siteKey}/files`, name: folder, primaryNodeType: 'jnt:folder'});
        imageNames.forEach(name => uploadFile('assets/uploadMedia/myfile.png', folderPath, name, 'image/png'));
    });

    after(() => {
        cy.logout();
        removeFixtures();
    });

    beforeEach(() => {
        cy.loginAndStoreSession();
    });

    it('Arrow keys move the preview in grid view', () => {
        context.tag('jcontent', 'keyboard-navigation', 'arrows-grid');
        const jcontent = JContent.visit(siteKey, 'en', `media/files/${folder}`);
        jcontent.switchToThumbnails();
        jcontent.getGrid().get().find('[data-cm-role="grid-content-list-card"]').should('have.length', imageNames.length);

        cy.get('[data-cm-role="grid-content-list-card"]').first().click();
        previewName().should('be.visible');

        cy.get('[data-cm-role="grid-content-list-card"]').then($cards => {
            const names = [...$cards].map(card => card.dataset.selRoleCard);
            previewName().should('contain.text', names[0]);

            press('rightarrow');
            previewName().should('contain.text', names[1]);
            // Down and up move to the next and previous item
            press('downarrow');
            previewName().should('contain.text', names[2]);
            press('uparrow');
            previewName().should('contain.text', names[1]);
            press('leftarrow');
            previewName().should('contain.text', names[0]);
        });
    });

    it.skip('Arrow keys move the preview in list view', () => {
        // TODO(https://github.com/Jahia/jcontent/issues/2924): ContentTable.jsx does not pass `index` to Row, so a row click stores an undefined selected index and every arrow key computes NaN.
        context.tag('jcontent', 'keyboard-navigation', 'arrows-list');
        const jcontent = JContent.visit(siteKey, 'en', `media/files/${folder}`);
        jcontent.switchToListMode();
        jcontent.getTable().get().find('[data-cm-role="table-content-list-row"]').should('have.length', imageNames.length);

        cy.get('[data-cm-role="table-content-list-row"]').then($rows => {
            const names = [...$rows].map(row => row.dataset.nodeName);
            jcontent.getTable().getRowByName(names[0]).click();
            previewName().should('contain.text', names[0]);
            cy.focused().should('have.attr', 'tabindex', '1');

            press('rightarrow');
            previewName().should('contain.text', names[1]);
            // Down and up move to the next and previous item
            press('downarrow');
            previewName().should('contain.text', names[2]);
            press('uparrow');
            previewName().should('contain.text', names[1]);
            press('leftarrow');
            previewName().should('contain.text', names[0]);
        });
    });
});
