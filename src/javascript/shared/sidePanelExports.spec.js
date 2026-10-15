import {ContentSidePanel} from '~/JContent/ContentRoute/ContentLayout/ContentSidePanel';
import {ContentSidePanelNodeFragment} from '~/JContent/ContentRoute/ContentLayout/ContentSidePanel.gql-fragments';
import {cmSetSidePanelSelection} from '~/JContent/redux/preview.redux';

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
         * assertions that pass whatever the shape says. What the fields are is stated in the
         * propTypes and in the fragment, where a consumer actually reads them.
         */
        expect(ContentSidePanel.propTypes.node).toBeDefined();
    });

    it('publishes the fragment that covers everything the panel reads', () => {
        // The reason this is exported at all: the contract is not guessable, and a node missing
        // one of its fields degrades a tab silently rather than failing.
        const printed = ContentSidePanelNodeFragment.loc.source.body;

        expect(printed).toContain('fragment ContentSidePanelNode on JCRNode');
        ['name', 'primaryNodeType', 'NodePreviewFields', 'NodeCacheRequiredFields']
            .forEach(field => expect(printed).toContain(field));
        // Needs $language, and the card falls back to name - so it stays with the consumer.
        expect(printed).not.toContain('displayName');
    });

    it('exposes the one action that opens and closes it', () => {
        // Opening is cmSetSidePanelSelection(path) and closing is the same action with null - which
        // is what the panel's own close button dispatches, so there is one way to do it.
        expect(typeof cmSetSidePanelSelection).toBe('function');
    });
});
