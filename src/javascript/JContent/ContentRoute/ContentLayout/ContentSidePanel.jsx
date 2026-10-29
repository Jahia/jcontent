import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'clsx';
import {shallowEqual, useSelector} from 'react-redux';
import {SidePanel} from '~/JContent/SidePanel';
import {JContentSidePanelContextProvider} from './JContentSidePanelContextProvider';
import styles from './ContentSidePanel.scss';

/**
 * The content side panel: preview, details, history and usages for one node.
 *
 * **Rendered unconditionally.** Whether there is anything to show is read from the store here, so
 * a caller does not repeat that condition - it returns nothing when nothing is selected. It also
 * owns its own container and width, which is the implementation detail a consumer would otherwise
 * have to reproduce: the panel is 600px wide, and saying so belongs with the panel.
 *
 * **It must be laid out in a flex ROW.** The container sets `flex: 0 0 600px`, which is a width
 * only in that context; in a column parent it becomes a height and the panel collapses.
 *
 * Everything else it needs - the content language, the accordion in view, the ticked rows, whether
 * the panel is full screen - is JContent's own state, so it is read rather than passed. The one
 * thing a caller must supply is the NODE, because only the caller's own rows have it.
 *
 * The tabs are whatever is registered on the `sidePanelTabsActions` target, so a consumer gets the
 * same panel the content list has, and follows it when that changes.
 */
export const ContentSidePanel = ({node}) => {
    const {isFullScreen, language, jcontentMode, selection, sidePanelSelection} = useSelector(state => ({
        isFullScreen: state.jcontent.previewIsFullScreen,
        language: state.language,
        jcontentMode: state.jcontent.mode,
        selection: state.jcontent.selection,
        sidePanelSelection: state.jcontent.sidePanelSelection
    }), shallowEqual);

    // The selection in the store is a path, and it is what says the panel is open - not the node,
    // which a caller resolves from its own rows and may not have found.
    if (!sidePanelSelection && !isFullScreen) {
        return false;
    }

    return (
        <div className={classNames(styles.sidePanel, {[styles.sidePanelFullScreen]: isFullScreen})}>
            <JContentSidePanelContextProvider
                sidePanelSelection={node}
                selection={selection}
                language={language}
                jcontentMode={jcontentMode}
                isFullScreen={isFullScreen}
            >
                <SidePanel/>
            </JContentSidePanelContextProvider>
        </div>
    );
};

ContentSidePanel.propTypes = {
    /**
     * The node to show, resolved by the caller from its own rows.
     *
     * A path is not enough, and the fields are not obvious: the provider resolves the edit form
     * from `uuid` and `primaryNodeType.name`, the card shows `name`, and the preview tab reads
     * `isPage`, `isContent`, `displayableNode`, `jView` and `pageAncestors` to decide whether the node renders
     * inside its page and where its CSS comes from. Select `ContentSidePanelNodeFragment` and the
     * whole contract is covered; miss one of them and the matching tab degrades silently.
     */
    node: PropTypes.shape({
        uuid: PropTypes.string,
        path: PropTypes.string,
        name: PropTypes.string,
        primaryNodeType: PropTypes.shape({name: PropTypes.string}),
        isPage: PropTypes.bool,
        isContent: PropTypes.bool,
        displayableNode: PropTypes.shape({path: PropTypes.string}),
        pageAncestors: PropTypes.array
    })
};

export default ContentSidePanel;
