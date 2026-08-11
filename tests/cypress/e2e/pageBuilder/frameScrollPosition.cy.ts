import {addNode, createSite, deleteSite} from '@jahia/cypress';
import {ContentEditor, JContent, JContentPageBuilder} from '../../page-object';

/**
 * Regression coverage for https://github.com/Jahia/jcontent/issues/2664 — after a save the page
 * builder came back somewhere else, and the content being edited was no longer where the editor had
 * left it.
 *
 * What these tests assert is where the *content* is, not what the scroll offset is. Those are not
 * the same thing: the frame does not reload in place (a hidden iframe loads the new document and the
 * two are swapped), and by the time the new one is on screen its layout has changed — the edited
 * content is a different size, its images have loaded, and the page-builder decorations have arrived
 * with the boxes. Holding the offset through all that does not hold the view still, so a test that
 * checks the offset can pass while the editor watches their content leave the screen.
 */
describe('Page builder - frame keeps its position', () => {
    const siteKey = 'frameScrollSite';
    const homePath = `/sites/${siteKey}/home`;
    const areaName = 'pagecontent';
    const areaPath = `${homePath}/${areaName}`;
    const listCount = 12;
    const editedListPath = `${areaPath}/list-${listCount}`;
    const editedTextPath = `${editedListPath}/text-${listCount}`;

    const activeFrame = () => cy.get('[data-sel-role="page-builder-frame-active"]');

    /** Where a module sits relative to the top of the viewport — what the editor actually sees. */
    const viewportTopOf = (path: string) => activeFrame().then($frame => {
        const win = ($frame[0] as HTMLIFrameElement).contentWindow;
        const element = win.document.querySelector(`[jahiatype="module"][path="${path}"]`);
        expect(element, `module ${path} is rendered`).to.not.be.null;
        return element.getBoundingClientRect().top;
    });

    /** The module the editor's view is anchored on: the one nearest the top edge of the viewport. */
    const anchorGeometry = () => activeFrame().then($frame => {
        const win = ($frame[0] as HTMLIFrameElement).contentWindow;
        return [...win.document.querySelectorAll('[jahiatype="module"][path]')]
            .map(element => ({path: element.getAttribute('path'), rect: element.getBoundingClientRect()}))
            .filter(({rect}) => rect.bottom > 0 && rect.top < win.innerHeight)
            .reduce((best, c) => (!best || Math.abs(c.rect.top) < Math.abs(best.rect.top) ? c : best), null);
    }).then(nearest => ({path: nearest.path, top: nearest.rect.top}));

    /** Retried like shouldSettleAt: the content must be somewhere the editor can actually see it. */
    const shouldBeInView = (path: string) => activeFrame().should($frame => {
        const win = ($frame[0] as HTMLIFrameElement).contentWindow;
        const element = win.document.querySelector(`[jahiatype="module"][path="${path}"]`);
        expect(element, `module ${path} is rendered`).to.not.be.null;
        const rect = element.getBoundingClientRect();
        expect(rect.bottom, `${path} is below the top edge`).to.be.greaterThan(0);
        expect(rect.top, `${path} is above the bottom edge`).to.be.lessThan(win.innerHeight);
    });

    /**
     * Asserts on where a module ends up, re-reading it on every retry.
     *
     * The reading has to happen inside the should() callback. A `.then()` that returns the number is
     * evaluated exactly once, and should() will not re-run it — so the assertion lands on whatever
     * instant the queue happened to reach, which during a frame swap is mid-transition. That is a test
     * that reports a drift the application does not have.
     */
    const shouldSettleAt = (path: string, expected: number, tolerance = 0) => activeFrame().should($frame => {
        const win = ($frame[0] as HTMLIFrameElement).contentWindow;
        const element = win.document.querySelector(`[jahiatype="module"][path="${path}"]`);
        expect(element, `module ${path} is rendered`).to.not.be.null;
        expect(element.getBoundingClientRect().top).to.be.closeTo(expected, tolerance);
    });

    let jcontent: JContentPageBuilder;

    before(() => {
        // Pinned on purpose: createSite defaults to dx-base-demo-templates, whose home page exposes a
        // different area, so a spec relying on the default only finds its content where that module
        // happens to be installed. This one declares a single `pagecontent` area and ships with the
        // tests.
        createSite(siteKey, {
            templateSet: 'jcontent-test-template',
            serverName: 'localhost',
            locale: 'en'
        });

        addNode({
            parentPathOrId: homePath,
            name: areaName,
            primaryNodeType: 'jnt:contentList',
            children: Array.from({length: listCount}, (_, i) => ({
                name: `list-${i + 1}`,
                primaryNodeType: 'jnt:contentList',
                children: [{
                    name: `text-${i + 1}`,
                    primaryNodeType: 'jnt:bigText',
                    properties: [{
                        name: 'text',
                        language: 'en',
                        value: `<p>Content number ${i + 1}</p>`.repeat(4)
                    }]
                }]
            }))
        });
    });

    after(() => {
        cy.logout();
        deleteSite(siteKey);
    });

    beforeEach(() => {
        cy.loginAndStoreSession();
        jcontent = JContent
            .visit(siteKey, 'en', 'pages/home')
            .switchToPageBuilder();
    });

    it('Leaves the page where it was, and the edited content in view, when it is saved', () => {
        jcontent.getModule(editedListPath).getBox().get().should('exist');

        // Bring it to the top of the viewport and open it, which is the reported flow
        activeFrame().then($frame => {
            const win = ($frame[0] as HTMLIFrameElement).contentWindow;
            const element = win.document.querySelector(`[jahiatype="module"][path="${editedListPath}"]`);
            win.scrollTo(0, win.scrollY + element.getBoundingClientRect().top);
        });

        jcontent.getModule(editedTextPath).doubleClick();
        const contentEditor = new ContentEditor();
        contentEditor.getRichTextField('jnt:bigText_text').type('edited');

        // The anchor is the content at the top of the viewport, so that is what must not move.
        // Deliberately not asserting the edited item lands to the pixel: saving marks it as modified,
        // which decorates it and legitimately shifts it down a little. What must not happen is the
        // page going somewhere else and taking it off screen — the reported defect.
        anchorGeometry().then(anchor => {
            activeFrame().invoke('attr', 'id').then(frameIdBeforeSave => {
                contentEditor.save();

                // Asserting before the swap would only re-read the outgoing frame, which trivially
                // still has its content in place.
                activeFrame().invoke('attr', 'id').should('not.eq', frameIdBeforeSave);

                shouldSettleAt(anchor.path, anchor.top, 1);
                shouldBeInView(editedTextPath);
            });
        });
    });

    it('Leaves the content in view where it was when the frame is refreshed', () => {
        jcontent.getModule(editedListPath).getBox().get().should('exist');

        activeFrame().then($frame => {
            const win = ($frame[0] as HTMLIFrameElement).contentWindow;
            const element = win.document.querySelector(`[jahiatype="module"][path="${editedListPath}"]`);
            win.scrollTo(0, win.scrollY + element.getBoundingClientRect().top);
        });

        viewportTopOf(editedListPath).then(topBeforeRefresh => {
            activeFrame().invoke('attr', 'id').then(frameIdBeforeRefresh => {
                jcontent.refresh();
                activeFrame().invoke('attr', 'id').should('not.eq', frameIdBeforeRefresh);

                // Nothing was edited here, so the content must come back where it was
                shouldSettleAt(editedListPath, topBeforeRefresh, 1);
            });
        });
    });

    it('Hides the frame it swapped out', () => {
        jcontent.getModule(editedListPath).getBox().get().should('exist');

        activeFrame().invoke('attr', 'id').then(frameIdBeforeRefresh => {
            jcontent.refresh();
            activeFrame().invoke('attr', 'id').should('not.eq', frameIdBeforeRefresh);

            // Both frames are absolutely positioned in the same container, so the outgoing one has to
            // be moved out of the way — left where it is, it keeps covering the incoming one.
            cy.get('[data-sel-role="page-builder-frame-inactive"]').should($frame => {
                expect(Number.parseFloat(getComputedStyle($frame[0]).top)).to.be.lessThan(-1000);
            });
        });
    });
});
