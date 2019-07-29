import React from 'react';
import PropTypes from 'prop-types';
import {compose} from 'react-apollo';
import {ContextualMenu} from '@jahia/react-material';
import {Drawer, Paper, withStyles} from '@material-ui/core';
import ContentListTable from './ContentListTable';
import PreviewDrawer from './PreviewDrawer';
import classNames from 'classnames';
import ContentTrees from './ContentTrees';
import {translate} from 'react-i18next';
import {CM_DRAWER_STATES} from '../../ContentManager.redux-actions';
import FilesGrid from './FilesGrid';
import ContentManagerConstants from '../../ContentManager.constants';
import {refetchContentTreeAndListData} from '../../ContentManager.refetches';
import Upload from './Upload';
import contentManagerStyleConstants from '../../ContentManager.style-constants';
import ResizableDrawer from './ResizableDrawer';

const styles = theme => ({
    root: {
        flex: '1 1 0%',
        display: 'flex',
        flexDirection: 'row',
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: theme.palette.background.paper
    },
    content: {
        flex: '1 2 0%',
        order: 2,
        display: 'flex',
        transition: 'margin-left .25s,margin-right .25s',
        backgroundColor: theme.palette.background.default,
        minWidth: 0
    },
    contentPaper: {
        flex: '1 1 auto',
        flexDirection: 'column',
        minWidth: 0,
        display: 'flex'
    },
    treeDrawer: {
        flex: '0 1 auto',
        display: 'flex',
        order: 1,
        transition: 'transform .15s'
    },
    treeDrawerPaper: {
        position: 'relative',
        display: 'flex',
        zIndex: 'auto',
        height: 'unset',
        overflow: 'hidden'
    },
    previewDrawer: {
        flex: '0 1 ' + contentManagerStyleConstants.previewDrawerWidth + 'px',
        order: 3,
        display: 'flex',
        overflow: 'hidden',
        transition: 'transform .15s'
    },
    previewDrawerHidden: {
        transform: 'translate(600px)'
    },
    previewDrawerPaper: {
        position: 'relative',
        display: 'flex',
        zIndex: 'auto',
        height: 'unset',
        transition: '.15s !important',
        overflow: 'hidden',
        maxWidth: contentManagerStyleConstants.previewDrawerWidth
    },
    previewDrawerPaperFullScreen: {
        transition: '.15s !important',
        width: '100vw',
        height: '100vh',
        top: 0,
        right: 0
    }
});

export class ContentLayout extends React.Component {
    refreshContentsAndTree(contentTreeConfigs) {
        refetchContentTreeAndListData(contentTreeConfigs);
    }

    render() {
        const {
            contentTreeConfigs, mode, path, previewState, classes, filesMode, treeState, treeWidth, previewSelection, rows, contentNotFound,
            totalCount, loading, setTreeWidth
        } = this.props;

        let contextualMenu = React.createRef();
        let treeOpen = treeState >= CM_DRAWER_STATES.SHOW && mode !== ContentManagerConstants.mode.SEARCH && mode !== ContentManagerConstants.mode.SQL2SEARCH;
        let previewOpen = previewState >= CM_DRAWER_STATES.SHOW;
        return (
            <>
                <div className={classes.root}>
                    <ResizableDrawer
                        variant="persistent"
                        anchor="left"
                        open={treeOpen}
                        classes={{
                            root: classes.treeDrawer,
                            paper: classes.treeDrawerPaper
                        }}
                        width={treeWidth}
                        onResized={width => setTreeWidth(width)}
                    >
                        <ContentTrees isOpen={treeOpen} width={treeWidth}/>
                    </ResizableDrawer>
                    <Drawer
                        data-cm-role="preview-drawer"
                        variant="persistent"
                        anchor="right"
                        open={previewOpen}
                        classes={{
                            root: classNames(classes.previewDrawer, {[classes.previewDrawerHidden]: !previewOpen}),
                            paper: classNames({
                                [classes.previewDrawerPaper]: previewState !== CM_DRAWER_STATES.FULL_SCREEN,
                                [classes.previewDrawerPaperFullScreen]: previewState === CM_DRAWER_STATES.FULL_SCREEN
                            })
                        }}
                    >
                        {previewOpen &&
                        <PreviewDrawer previewSelection={rows.find(node => node.path === previewSelection)}/>
                        }
                    </Drawer>
                    <ContextualMenu ref={contextualMenu} actionKey="contentMenu" context={{path: path}}/>
                    <div
                        className={classNames(classes.content)}
                        style={{
                            marginLeft: treeOpen ? 0 : -treeWidth,
                            marginRight: previewOpen ? 0 : -contentManagerStyleConstants.previewDrawerWidth
                        }}
                        onContextMenu={event => contextualMenu.current.open(event)}
                    >
                        <Paper className={classes.contentPaper}>
                            {mode === ContentManagerConstants.mode.FILES && filesMode === 'grid' ?
                                <FilesGrid totalCount={totalCount}
                                           rows={rows}
                                           contentNotFound={contentNotFound}
                                           loading={loading}/> :
                                <ContentListTable totalCount={totalCount}
                                                  rows={rows}
                                                  contentNotFound={contentNotFound}
                                                  loading={loading}/>
                            }
                        </Paper>
                    </div>
                </div>
                <Upload uploadUpdateCallback={status => {
                    if (status && status.uploading === 0) {
                        this.refreshContentsAndTree(contentTreeConfigs);
                    }
                }}/>
            </>
        );
    }
}

ContentLayout.propTypes = {
    mode: PropTypes.string.isRequired,
    path: PropTypes.string.isRequired,
    classes: PropTypes.object.isRequired,
    filesMode: PropTypes.string.isRequired,
    treeState: PropTypes.number.isRequired,
    treeWidth: PropTypes.number.isRequired,
    previewState: PropTypes.number.isRequired,
    contentTreeConfigs: PropTypes.object,
    previewSelection: PropTypes.string,
    rows: PropTypes.array.isRequired,
    contentNotFound: PropTypes.bool,
    totalCount: PropTypes.number.isRequired,
    loading: PropTypes.bool.isRequired,
    setTreeWidth: PropTypes.func.isRequired
};

export default compose(
    translate(),
    withStyles(styles),
)(ContentLayout);
