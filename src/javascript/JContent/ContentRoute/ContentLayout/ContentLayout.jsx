import React, {useRef} from 'react';
import PropTypes from 'prop-types';
import {Paper} from '@material-ui/core';
import {ContentTable} from './ContentTable';
import {ContentSidePanel} from './ContentSidePanel';
import classNames from 'clsx';
import FilesGrid from './FilesGrid';
import JContentConstants from '~/JContent/JContent.constants';
import {ErrorBoundary} from '@jahia/jahia-ui-root';
import {flattenTree} from './ContentLayout.utils';
import styles from './ContentLayout.scss';
import {shallowEqual, useSelector} from 'react-redux';

export const ContentLayout = ({mode, filesMode, sidePanelSelection, rows, isContentNotFound, totalCount, isLoading, isStructured}) => {
    const contextualMenu = useRef();
    // The panel reads the rest of what it needs from the store itself - see ContentSidePanel.
    const isFullScreen = useSelector(state => state.jcontent.previewIsFullScreen);

    const resolvedSidePanelSelection = flattenTree(rows).find(n => n.path === sidePanelSelection);

    return (
        <div className={styles.root}>
            {!isFullScreen && (
                <div
                    className={classNames(styles.content)}
                    onContextMenu={event => contextualMenu.current(event)}
                >
                    <Paper className={styles.contentPaper}>
                        <ErrorBoundary key={filesMode}>
                            {mode === JContentConstants.mode.MEDIA && filesMode === JContentConstants.mode.GRID ?
                                <FilesGrid totalCount={totalCount}
                                           rows={rows}
                                           isContentNotFound={isContentNotFound}
                                           isLoading={isLoading}/> :
                                <ContentTable totalCount={totalCount}
                                              rows={rows}
                                              isContentNotFound={isContentNotFound}
                                              isStructured={isStructured}
                                              isLoading={isLoading}/>}
                        </ErrorBoundary>
                    </Paper>
                </div>
            )}

            <ContentSidePanel node={resolvedSidePanelSelection}/>
        </div>
    );
};

ContentLayout.propTypes = {
    mode: PropTypes.string.isRequired,
    filesMode: PropTypes.string.isRequired,
    sidePanelSelection: PropTypes.string,
    rows: PropTypes.array.isRequired,
    isContentNotFound: PropTypes.bool,
    totalCount: PropTypes.number.isRequired,
    isLoading: PropTypes.bool.isRequired,
    isStructured: PropTypes.bool
};

export default ContentLayout;
