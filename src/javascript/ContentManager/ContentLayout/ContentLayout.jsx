import React from 'react';
import {compose, withApollo} from 'react-apollo';
import {ContextualMenu, withNotifications} from '@jahia/react-material';
import {Drawer, Paper, withStyles} from '@material-ui/core';
import ContentListTable from './ContentListTable';
import PreviewDrawer from './PreviewDrawer';
import classNames from 'classnames';
import ContentTrees from './ContentTrees';
import {translate} from 'react-i18next';
import Upload from './Upload';
import {CM_DRAWER_STATES} from '../ContentManager.redux-actions';
import FilesGrid from './FilesGrid';
import ContentData from './ContentData';
import {connect} from 'react-redux';
import ContentManagerConstants from '../ContentManager.constants';
import {refetchContentTreeAndListData, setContentListDataRefetcher, setRefetcher} from '../ContentManager.refetches';

const styles = theme => ({
    content: {
        height: 'calc( 100vh - ' + theme.contentManager.topBarHeight + 'px )',
        flexGrow: 1,
        transitionDuration: '.25s',
        backgroundColor: theme.palette.background.default,
        marginLeft: -theme.contentManager.treeDrawerWidth,
        marginRight: -theme.contentManager.previewDrawerWidth,
        width: '100%'
    },
    contentLeftShift: {
        width: 'calc(100% - ' + theme.contentManager.treeDrawerWidth + 'px)',
        marginLeft: 0
    },
    contentRightShift: {
        width: 'calc(100% - ' + theme.contentManager.previewDrawerWidth + 'px)',
        marginRight: 0
    },
    treeDrawer: {
        height: 'calc( 100vh - ' + theme.contentManager.topBarHeight + 'px )',
        transitionDuration: '.15s'
    },
    treeDrawerPaper: {
        width: theme.contentManager.treeDrawerWidth,
        position: 'inherit',
        overflow: 'hidden'
    },
    previewDrawer: {
        height: 'calc( 100vh - ' + theme.contentManager.topBarHeight + 'px )',
        display: 'flex',
        overflow: 'hidden',
        transitionDuration: '.15s'
    },
    previewDrawerHidden: {
        transform: 'translate(600px)'
    },
    previewDrawerPaper: {
        transition: '.15s !important',
        width: theme.contentManager.previewDrawerWidth,
        height: 'calc(100vh - 130px)',
        position: 'inherit',
        overflow: 'hidden',
        top: '150px',
        right: '600px'
    },
    previewDrawerPaperFullScreen: {
        transition: '.15s !important',
        width: '100vw',
        height: '100vh',
        top: 0,
        right: 0
    },
    appFrame: {
        overflow: 'hidden',
        position: 'relative',
        display: 'flex',
        width: '100%',
        maxWidth: 'calc(100vw - 140px)',
        backgroundColor: theme.palette.background.paper
    }
});

export class ContentLayout extends React.Component {
    setContentRefetcher(refetchingData) {
        setContentListDataRefetcher(refetchingData);
    }

    setTreeRefetcher(type) {
        return refetchingData => setRefetcher(type, refetchingData);
    }

    refreshContentsAndTree(contentTreeConfigs) {
        refetchContentTreeAndListData(contentTreeConfigs);
    }

    render() {
        const {contentTreeConfigs, mode, path, previewState, classes, filesMode, treeState, previewSelection} = this.props;
        let contextualMenu = React.createRef();
        let treeOpen = treeState >= CM_DRAWER_STATES.SHOW && mode !== ContentManagerConstants.mode.SEARCH && mode !== ContentManagerConstants.mode.SQL2SEARCH;
        let previewOpen = previewState >= CM_DRAWER_STATES.SHOW;
        return (
            <React.Fragment>
                <ContentData setRefetch={this.setContentRefetcher}>
                    {({rows, contentNotFound, totalCount}) => (
                        <div className={classes.appFrame}>
                            <Drawer
                                variant="persistent"
                                anchor="left"
                                open={treeOpen}
                                classes={{
                                    root: classes.treeDrawer,
                                    paper: classes.treeDrawerPaper
                                }}
                            >
                                <ContentTrees isOpen={treeOpen} setRefetch={this.setTreeRefetcher}/>
                            </Drawer>
                            <ContextualMenu ref={contextualMenu} actionKey="contentMenu" context={{path: path}}/>
                            <div
                                className={classNames(classes.content, {
                                    [classes.contentLeftShift]: treeOpen,
                                    [classes.contentRightShift]: previewOpen
                                })}
                                onContextMenu={event => contextualMenu.current.open(event)}
                            >
                                <Paper>
                                    {mode === ContentManagerConstants.mode.FILES && filesMode === 'grid' ?
                                        <FilesGrid totalCount={totalCount} rows={rows} contentNotFound={contentNotFound}/> :
                                        <ContentListTable totalCount={totalCount} rows={rows} contentNotFound={contentNotFound}/>
                                    }
                                </Paper>
                            </div>
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
                        </div>
                    )}
                </ContentData>

                <Upload uploadUpdateCallback={status => {
                    if (status && status.uploading === 0) {
                        this.refreshContentsAndTree(contentTreeConfigs);
                    }
                }}/>
            </React.Fragment>
        );
    }
}

const mapStateToProps = state => {
    return {
        mode: state.mode,
        siteKey: state.site,
        path: state.path,
        previewState: state.previewState,
        treeState: state.treeState,
        filesMode: state.filesGrid.mode,
        previewSelection: state.previewSelection
    };
};

export default compose(
    withNotifications(),
    translate(),
    withStyles(styles),
    withApollo,
    connect(mapStateToProps)
)(ContentLayout);
