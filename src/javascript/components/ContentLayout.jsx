import React from 'react';
import {compose, withApollo} from 'react-apollo';
import {ContextualMenu, withNotifications} from '@jahia/react-material';
import {Button, Drawer, Grid, IconButton, Paper, Snackbar, withStyles} from '@material-ui/core';
import {Close} from '@material-ui/icons';
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
    close: {
        padding: theme.spacing.unit / 2
    },
    topBar: {
        paddingTop: theme.spacing.unit * 2,
        color: theme.palette.primary.contrastText
    },
    paper: {
        backgroundColor: theme.palette.background.paper
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
    previewDrawerPaper: {
        width: theme.contentManager.previewDrawerWidth,
        display: 'flex',
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
        transition: 'inherit !important',
        transitionDuration: '.2s !important'
    },
    appFrame: {
        overflow: 'hidden',
        position: 'relative',
        display: 'flex',
        width: '100%'
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
        const {contentTreeConfigs, mode, path, previewState, classes, filesMode, treeState} = this.props;
        let contextualMenu = React.createRef();
        return (
            <React.Fragment>
                <Snackbar
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'left'
                    }}
                    open="true"
                    autoHideDuration={6000}
                    ContentProps={{
                        'aria-describedby': 'message-id'
                    }}
                    message={<Trans
                        i18nKey="label.contentManager.link.academy"
                    />}
                    action={[
                        <Button key="undo" variant="contained" color="default" size="small">
                            Go to Academy
                        </Button>,
                        <IconButton
                            key="close"
                            aria-label="Close"
                            color="inherit"
                            className={classes.close}
                        >
                            <Close/>
                        </IconButton>
                    ]}
                />
                <Grid container spacing={0}>
                    <Grid item xs={GRID_SIZE} className={classes.topBar}>
                        <CMTopBar mode={mode}/>
                    </Grid>
                </Grid>
                <div className={classes.appFrame}>
                    <Drawer
                        className={classes.treeDrawer}
                        variant="persistent"
                        anchor="left"
                        open={treeState >= CM_DRAWER_STATES.SHOW}
                        classes={{paper: classes.treeDrawerPaper}}
                    >
                        <ContentTrees
                            isOpen={treeState >= CM_DRAWER_STATES.SHOW}
                            setRefetch={this.setTreeRefetcher}
                        />
                    </Drawer>
                    <ContextualMenu ref={contextualMenu} actionKey="contentTreeActions" context={{path: path}}/>
                    <main
                        className={classNames(classes.content, {
                            [classes.contentLeftShift]: treeState === CM_DRAWER_STATES.SHOW,
                            [classes.contentRightShift]: previewState === CM_DRAWER_STATES.SHOW
                        })}
                        onContextMenu={event => contextualMenu.current.open(event)}
                    >
                        <ContentData setRefetch={this.setContentRefetcher} treeShown={open}>
                            {({rows, contentNotFound, totalCount}) => {
                                return (
                                    <Paper
                                        className={classes.paper}
                                    >{mode === Constants.mode.FILES && filesMode === 'grid' ?
                                        <FilesGrid totalCount={totalCount} rows={rows} contentNotFound={contentNotFound}/> :
                                        <ContentListTable totalCount={totalCount} rows={rows} contentNotFound={contentNotFound}/>
                                    }
                                    </Paper>
                                );
                            }}
                        </ContentData>
                    </main>
                    <Drawer data-cm-role="preview-drawer"
                            variant="persistent"
                            anchor="right"
                            open={previewState >= CM_DRAWER_STATES.SHOW}
                            classes={{
                                docked: classes.previewDrawer,
                                paper: previewState === CM_DRAWER_STATES.FULL_SCREEN ? classes.previewDrawerPaperFullScreen : classes.previewDrawerPaper,
                                paperAnchorDockedRight: previewState >= CM_DRAWER_STATES.SHOW ? classes.previewDrawerTransition : ''
                            }}
                    >
                        {previewState >= CM_DRAWER_STATES.SHOW && <PreviewDrawer/>}
                    </Drawer>
                </div>

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
        filesMode: state.filesGrid.mode
    };
};

export default compose(
    withNotifications(),
    translate(),
    withStyles(styles),
    withApollo,
    connect(mapStateToProps)
)(ContentLayout);
