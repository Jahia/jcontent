import {SidePanel, SidePanelContextProvider, useSidePanelContext} from '~/JContent/SidePanel';
import {JContentSidePanelContextProvider} from '~/JContent/ContentRoute/ContentLayout/JContentSidePanelContextProvider';
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
    it('exposes the panel and its context', () => {
        expect(typeof SidePanel).toBe('function');
        expect(typeof useSidePanelContext).toBe('function');

        // Not a function: this one is `SidePanelContext.Provider` rather than a component of its
        // own, so React hands back an exotic object. Asserted as defined rather than by its
        // `$$typeof`, which is React's own internal and not something to pin a test to.
        expect(SidePanelContextProvider).toBeDefined();
    });

    it('exposes the provider that feeds the panel its node', () => {
        // What resolves the form definition, the technical info and whether there is a preview at
        // all - the tabs read everything from it, so exporting the panel without it offers nothing.
        expect(typeof JContentSidePanelContextProvider).toBe('function');
    });

    it('exposes the actions the panel dispatches against', () => {
        // The panel's own close button dispatches cmCloseSidePanel, so a consumer holding the
        // selection in state of its own would find that button did nothing.
        expect(typeof cmSetSidePanelSelection).toBe('function');
        expect(typeof cmCloseSidePanel).toBe('function');
        expect(typeof cmSetPreviewFullScreen).toBe('function');
    });
});
