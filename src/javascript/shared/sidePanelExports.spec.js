import {ContentSidePanel} from '~/JContent/ContentRoute/ContentLayout/ContentSidePanel';
import {cmCloseSidePanel, cmSetPreviewFullScreen, cmSetSidePanelSelection} from '~/JContent/redux/preview.redux';

/**
 * The symbols `shared/index.js` re-exports for the side panel.
 *
 * These are a public API: `shared/index.js` is what `@jahia/jcontent` resolves to over module
 * federation, so another module - one supplying its own accordion route, which loses ContentLayout
 * and the panel with it - imports them to show the same panel jContent's content list shows.
 *
 * Worth a test because nothing inside jContent imports through that barrel, so moving or renaming
 * any of these still builds here. The consumer resolves at RUNTIME, in another repository, and gets
 * `undefined` - which a caller guarding for an older jContent reads as "not supported yet" and
 * quietly stops offering the feature. No error, nothing in the log, just a panel that is not there.
 *
 * **What this does and does not cover.** It imports the same modules the barrel does, by the same
 * paths, so a rename or a move fails here. It does NOT read the barrel itself - importing that
 * pulls in ContentTree, @jahia/icons and material-ui and measured 108s against 12s for this, which
 * is not worth paying on every run to catch a re-export line being deleted outright. A broken path
 * in the barrel already fails the webpack build.
 */
describe('the side panel exports', () => {
    it('exposes the panel as one component', () => {
        // One component rather than the panel and its context separately: the two cannot work
        // apart, so composing them here leaves a consumer nothing to assemble wrongly.
        expect(typeof ContentSidePanel).toBe('function');
    });

    it('declares the node it is called with, rather than taking any object', () => {
        /*
         * Only that the contract is DECLARED. PropTypes.shape returns a validator, not a spec, so
         * the individual fields cannot be read back out - asserting them one by one here would be
         * six assertions that pass whatever the shape says. What the fields are is stated in the
         * propTypes and in the barrel's comment, where a consumer actually reads them; what this
         * catches is the declaration being dropped altogether, which would turn a documented
         * contract back into "pass any object and hope".
         */
        expect(ContentSidePanel.propTypes.sidePanelSelection).toBeDefined();
        expect(ContentSidePanel.propTypes.language).toBeDefined();
        expect(ContentSidePanel.propTypes.jcontentMode).toBeDefined();
    });

    it('exposes the actions the panel dispatches against', () => {
        // The panel's own close button dispatches cmCloseSidePanel, so a consumer holding the
        // selection in state of its own would find that button did nothing.
        expect(typeof cmSetSidePanelSelection).toBe('function');
        expect(typeof cmCloseSidePanel).toBe('function');
        expect(typeof cmSetPreviewFullScreen).toBe('function');
    });
});
