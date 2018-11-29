import React from 'react';
import {compose, withApollo} from 'react-apollo';
import * as _ from 'lodash';
import {ContextualMenu, withNotifications} from '@jahia/react-material';
import {Drawer, Grid, Paper, Typography, withStyles} from '@material-ui/core';
import ContentListTable from './list/ContentListTable';
import PreviewDrawer from './preview/PreviewDrawer';
import classNames from 'classnames';
import ContentTrees from './ContentTrees';
import {Trans, translate} from 'react-i18next';
import {DxContext} from './DxContext';
import Upload from './fileupload/Upload';
import {CM_DRAWER_STATES, cmGoto, cmSetTreeState} from './redux/actions';
import FilesGrid from './filesGrid/FilesGrid';
import {ContentData, contentQueryHandlerByMode} from './ContentData';
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

    isBrowsing() {
        let {mode} = this.props;
        return (mode === Constants.mode.BROWSE || mode === Constants.mode.FILES);
    }

    isSearching() {
        let {mode} = this.props;
        return (mode === Constants.mode.SEARCH || mode === Constants.mode.SQL2SEARCH);
    }

    isRootNode() {
        let {path, siteKey} = this.props;
        return (path === ('/sites/' + siteKey));
    }

    render() {
        const {
            contentTreeConfigs, mode, path, uiLang, lang, siteKey, previewState, searchTerms,
            searchContentType, sql2SearchFrom, sql2SearchWhere, classes, filesMode, treeState, pagination, sort
        } = this.props;
        let queryHandler = contentQueryHandlerByMode(mode);
        const layoutQuery = queryHandler.getQuery();
        const rootPath = `/sites/${siteKey}`;
        const params = {
            searchContentType: searchContentType,
            searchTerms: searchTerms,
            sql2SearchFrom: sql2SearchFrom,
            sql2SearchWhere: sql2SearchWhere
        };

        const layoutQueryParams = queryHandler.getQueryParams(path, uiLang, lang, params, rootPath, pagination, sort, treeState);
        let contextualMenu = React.createRef();
        return (
            <DxContext.Consumer>{dxContext => {
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
                                <CMTopBar dxContext={dxContext} mode={mode}/>
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
                                    path={path}
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
                                <ContentData layoutQuery={layoutQuery}
                                    layoutQueryParams={layoutQueryParams}
                                    setRefetch={this.setContentRefetcher}
                                    orderBy={sort.orderBy}
                                    treeShown={open}
                                    >
                                    {({rows, contentNotFound, totalCount}) => {
                                        return (
                                            <Paper
                                                className={classes.paper}
                                                >{mode === Constants.mode.FILES && filesMode === 'grid' ?
                                                    <FilesGrid
                                                        totalCount={totalCount}
                                                        path={path}
                                                        rows={rows}
                                                        contentNotFound={contentNotFound}
                                                        pageSize={pagination.pageSize}
                                                        page={pagination.currentPage}
                                                /> :
                                                    <ContentListTable
                                                        totalCount={totalCount}
                                                        rows={rows}
                                                        contentNotFound={contentNotFound}
                                                        pageSize={pagination.pageSize}
                                                        page={pagination.currentPage}
                                                />
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
                                {previewState === CM_DRAWER_STATES.SHOW && <PreviewDrawer
                                    layoutQuery={layoutQuery}
                                    layoutQueryParams={layoutQueryParams}
                                    dxContext={dxContext}
                                />}
                            </Drawer>
                        </div>

                        <Upload uploadUpdateCallback={status => {
                            if (status && status.uploading === 0) {
                                this.refreshContentsAndTree(contentTreeConfigs);
                            }
                        }}/>
                    </React.Fragment>
                );
            }}
            </DxContext.Consumer>
        );
    }
}

const mapStateToProps = state => {
    return {
        mode: state.mode,
        siteKey: state.site,
        path: state.path,
        lang: state.language,
        selection: state.selection,
        previewState: state.previewState,
        treeState: state.treeState,
        params: state.params,
        uiLang: state.uiLang,
        searchTerms: state.params.searchTerms,
        searchContentType: state.params.searchContentType,
        sql2SearchFrom: state.params.sql2SearchFrom,
        sql2SearchWhere: state.params.sql2SearchWhere,
        filesMode: state.filesGrid.mode,
        pagination: state.pagination,
        sort: state.sort
    };
};

const mapDispatchToProps = dispatch => ({
    setPath: (path, params) => dispatch(cmGoto(path, params)),
    setTreeState: state => dispatch(cmSetTreeState(state)),
    clearSearch: params => {
        params = _.clone(params);
        _.unset(params, 'searchContentType');
        _.unset(params, 'searchTerms');
        _.unset(params, 'sql2SearchFrom');
        _.unset(params, 'sql2SearchWhere');
        dispatch(cmGoto({mode: 'browse', params: params}));
    }
});

export default compose(
    withNotifications(),
    translate(),
    withStyles(styles),
    withApollo,
    connect(mapStateToProps, mapDispatchToProps)
)(ContentLayout);
