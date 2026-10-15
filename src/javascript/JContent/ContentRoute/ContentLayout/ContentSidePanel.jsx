import React from 'react';
import PropTypes from 'prop-types';
import {SidePanel} from '~/JContent/SidePanel';
import {JContentSidePanelContextProvider} from './JContentSidePanelContextProvider';

/**
 * The content side panel: preview, details, history and usages for one node.
 *
 * The panel and the context it reads are one unit - the panel is meaningless without a provider
 * built from JContent's own state - so they are composed here rather than at each call site. That
 * is also what keeps the exported surface to a single component: a consumer says what to show, not
 * how the pieces fit together.
 *
 * The tabs are whatever is registered on the `sidePanelTabsActions` target, so a caller gets the
 * same panel the content list has, and follows it when that changes.
 *
 * @param sidePanelSelection the NODE to show, not a path - see propTypes for the fields it must carry
 * @param selection the rows currently ticked, which the panel reports on instead when non-empty
 * @param language the content language the panel reads in
 * @param jcontentMode the accordion the caller is rendering, passed through to the tabs
 * @param isFullScreen whether the panel is asking for the whole pane
 */
export const ContentSidePanel = ({sidePanelSelection, selection, language, jcontentMode, isFullScreen}) => (
    <JContentSidePanelContextProvider
        sidePanelSelection={sidePanelSelection}
        selection={selection}
        language={language}
        jcontentMode={jcontentMode}
        isFullScreen={isFullScreen}
    >
        <SidePanel/>
    </JContentSidePanelContextProvider>
);

ContentSidePanel.propTypes = {
    /**
     * The node to show. A path is not enough: the provider reads `uuid` and `primaryNodeType.name`
     * to resolve the edit form, and the preview tab reads `isPage`, `displayableNode`, `jView` and
     * `pageAncestors` to decide whether the node renders inside its page and where its CSS comes
     * from. A caller fetching its own rows should select jContent's own `NodePreviewFields` set, or
     * the preview falls back to rendering the node standalone - markup with no page around it.
     */
    sidePanelSelection: PropTypes.shape({
        uuid: PropTypes.string,
        path: PropTypes.string.isRequired,
        primaryNodeType: PropTypes.shape({name: PropTypes.string}),
        isPage: PropTypes.bool,
        displayableNode: PropTypes.shape({path: PropTypes.string}),
        pageAncestors: PropTypes.array
    }),
    selection: PropTypes.array.isRequired,
    language: PropTypes.string.isRequired,
    jcontentMode: PropTypes.string.isRequired,
    isFullScreen: PropTypes.bool.isRequired
};

export default ContentSidePanel;
