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

const treeDrawerWidth = 260;
const previewDrawerWidth = 600;

const styles = theme => ({
    topBar: {
        color: theme.palette.primary.contrastText
    },
    paper: {
        backgroundColor: theme.palette.background.paper
    },
    content: {
        flexGrow: 1,
        backgroundColor: theme.palette.background.default,
        marginLeft: -treeDrawerWidth,
        marginRight: -previewDrawerWidth
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
        width: treeDrawerWidth,
        flexShrink: 0
    },
    treeDrawerPaper: {
        width: treeDrawerWidth,
        top: 'unset',
        left: 'unset',
        zIndex: 2000
    },
    previewDrawer: {
        width: previewDrawerWidth,
        flexShrink: 0
    },
    previewDrawerPaper: {
        width: previewDrawerWidth,
        top: 'unset',
        right: 38,
        zIndex: 2000
    },
    appFrame: {
        zIndex: 0,
        overflow: 'hidden',
        position: 'relative',
        display: 'flex',
        width: '100%'
    },
    academyLink: {
        position: 'fixed',
        top: 0,
        right: 0,
        width: '50%',
        background: 'linear-gradient(to right, rgba(78, 81, 86, 0) 0%, #4e5156 100%) !important',
        zIndex: '2000',
        textAlign: 'right',
        color: theme.palette.text.contrastText,
        marginRight: 50,
        '& a': {
            color: 'inherit'
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
        const {contentTreeConfigs, mode, path, previewState, classes, filesMode, treeState} = this.props;
        let contextualMenu = React.createRef();
        return (
            <React.Fragment>
                <Typography variant="caption" className={classes.academyLink}>
                    <Trans
                        i18nKey="label.contentManager.link.academy"
                        components={[<a key="academyLink" href={contextJsParameters.config.academyLink} target="_blank" rel="noopener noreferrer">univers</a>]}
                    />
                </Typography>
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
                        open={treeState === CM_DRAWER_STATES.SHOW}
                        classes={{paper: classes.treeDrawerPaper}}
                        >
                        <ContentTrees
                            isOpen={treeState === CM_DRAWER_STATES.SHOW}
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
                    <Drawer
                        data-cm-role="preview-drawer"
                        className={classes.previewDrawer}
                        variant="persistent"
                        anchor="right"
                        open={previewState === CM_DRAWER_STATES.SHOW}
                        classes={{paper: classes.previewDrawerPaper}}
                        >
                        {previewState === CM_DRAWER_STATES.SHOW && <PreviewDrawer/>}
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
