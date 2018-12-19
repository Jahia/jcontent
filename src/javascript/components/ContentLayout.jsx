import React from 'react';
import {compose, withApollo} from 'react-apollo';
import {ContextualMenu, withNotifications} from '@jahia/react-material';
import {Drawer, Grid, Paper, Typography, withStyles} from '@material-ui/core';
import ContentListTable from './list/ContentListTable';
import PreviewDrawer from './preview/PreviewDrawer';
import classNames from 'classnames';
import ContentTrees from './ContentTrees';
import {Trans, translate} from 'react-i18next';
import Upload from './fileupload/Upload';
import {CM_DRAWER_STATES} from './redux/actions';
import FilesGrid from './filesGrid/FilesGrid';
import {ContentData} from './ContentData';
import CMTopBar from './CMTopBar';
import {connect} from 'react-redux';
import Constants from './constants';
import {refetchContentTreeAndListData, setContentListDataRefetcher, setRefetcher} from './refetches';

const styles = theme => ({
    topBar: {
        paddingTop: theme.spacing.unit * 2,
        color: theme.palette.primary.contrastText
    },
    content: {
        height: 'calc( 100vh - ' + theme.contentManager.topBarHeight + 'px )',
        flexGrow: 1,
        backgroundColor: theme.palette.background.default,
        marginLeft: -theme.contentManager.treeDrawerWidth,
        marginRight: -theme.contentManager.previewDrawerWidth
    },
    contentLeftShift: {
        marginLeft: 0,
        transition: ['margin-left 0ms 225ms']
    },
    contentRightShift: {
        marginRight: 0,
        transition: ['margin-right 0ms 225ms']
    },
    treeDrawer: {
        height: 'calc( 100vh - ' + theme.contentManager.topBarHeight + 'px )'
    },
    treeDrawerPaper: {
        width: theme.contentManager.treeDrawerWidth,
        position: 'inherit',
        overflow: 'hidden'
    },
    previewDrawer: {
        height: 'calc( 100vh - ' + theme.contentManager.topBarHeight + 'px )',
        display: 'flex',
        overflow: 'hidden'
    },
    previewDrawerHidden: {
        zIndex: -20
    },
    previewDrawerPaper: {
        width: theme.contentManager.previewDrawerWidth,
        position: 'inherit',
        overflow: 'hidden',
        top: '150px',
        right: theme.spacing.unit * 5
    },
    previewDrawerPaperFullScreen: {
        width: '100vw',
        height: '100vh',
        top: 0,
        right: 0
    },
    previewDrawerTransition: {
        transition: 'cubic-bezier(.42,0,.58,1) .2s !important',
        transitionDuration: '.2s !important'
    },
    appFrame: {
        overflow: 'hidden',
        position: 'relative',
        display: 'flex',
        width: '100%'
    },
    metaNav: {
        position: 'absolute',
        width: '50%',
        height: theme.spacing.unit * 3,
        top: 0,
        right: 0,
        paddingRight: theme.spacing.unit * 4,
        textAlign: 'right',
        color: theme.palette.text.contrastText + '!important',
        background: 'linear-gradient(to right, rgba(78, 81, 86, 0) 0%, ' + theme.palette.layout.main + ' 100%) !important;',
        '& a': {
            color: 'inherit!important'
        }
    }
});

const GRID_SIZE = 12;

class ContentLayout extends React.Component {
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
        const {contentTreeConfigs, mode, path, previewState, classes, filesMode, treeState, selection} = this.props;
        let contextualMenu = React.createRef();
        let treeOpen = treeState >= CM_DRAWER_STATES.SHOW && mode !== Constants.mode.SEARCH && mode !== Constants.mode.SQL2SEARCH;
        let previewOpen = previewState >= CM_DRAWER_STATES.SHOW;
        return (
            <React.Fragment>
                <div className={classes.metaNav}>
                    <Typography variant="overline" color="inherit"><Trans i18nKey="label.contentManager.link.academy" components={[<a key="academyLink" href={contextJsParameters.config.academyLink} target="_blank" rel="noopener noreferrer">univers</a>]}/></Typography>
                </div>
                <Grid container spacing={0}>
                    <Grid item xs={GRID_SIZE} className={classes.topBar}>
                        <CMTopBar mode={mode}/>
                    </Grid>
                </Grid>
                <ContentData setRefetch={this.setContentRefetcher} treeShown={open}>
                    {({rows, contentNotFound, totalCount}) => (
                        <div className={classes.appFrame}>
                            <Drawer variant="persistent"
                                    anchor="left"
                                    open={treeOpen}
                                    classes={{
                                        root: classes.treeDrawer,
                                        paper: classes.treeDrawerPaper
                                    }}
                            >
                                <ContentTrees isOpen={treeOpen}
                                              setRefetch={this.setTreeRefetcher}
                                />
                            </Drawer>
                            <ContextualMenu ref={contextualMenu} actionKey="contentTreeActions" context={{path: path}}/>
                            <main className={classNames(classes.content, {
                                [classes.contentLeftShift]: treeOpen,
                                [classes.contentRightShift]: previewOpen
                            })}
                                  onContextMenu={event => contextualMenu.current.open(event)}
                            >
                                <Paper>
                                    {mode === Constants.mode.FILES && filesMode === 'grid' ?
                                        <FilesGrid totalCount={totalCount} rows={rows} contentNotFound={contentNotFound}/> :
                                        <ContentListTable totalCount={totalCount} rows={rows} contentNotFound={contentNotFound}/>
                                    }
                                </Paper>
                            </main>
                            <Drawer data-cm-role="preview-drawer"
                                    variant="persistent"
                                    anchor="right"
                                    open={previewOpen}
                                    classes={{
                                        root: classNames(classes.previewDrawer, {[classes.previewDrawerHidden]: !previewOpen}),
                                        paper: classNames({
                                            [classes.previewDrawerPaper]: previewState !== CM_DRAWER_STATES.FULL_SCREEN,
                                            [classes.previewDrawerPaperFullScreen]: previewState === CM_DRAWER_STATES.FULL_SCREEN,
                                            [classes.previewDrawerTransition]: previewOpen
                                        })
                                    }}
                            >
                                {previewOpen && <PreviewDrawer selection={rows.find(node => node.path === selection)}/>}
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
        selection: state.selection
    };
};

export default compose(
    withNotifications(),
    translate(),
    withStyles(styles),
    withApollo,
    connect(mapStateToProps)
)(ContentLayout);
