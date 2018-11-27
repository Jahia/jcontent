import React from 'react';
import {compose, withApollo} from 'react-apollo';
import * as _ from 'lodash';
import {Close} from '@material-ui/icons';
import {withNotifications, ContextualMenu} from '@jahia/react-material';
import {Grid, Button, Paper, withStyles, Drawer} from '@material-ui/core';
import ContentListTable from './list/ContentListTable';
import PreviewDrawer from './preview/PreviewDrawer';
import classNames from 'classnames';
import ContentTrees from './ContentTrees';
import {translate, Trans} from 'react-i18next';
import {DxContext} from './DxContext';
import Upload from './fileupload/Upload';
import {cmSetPreviewState, CM_PREVIEW_STATES} from './redux/actions';
import FilesGrid from './filesGrid/FilesGrid';
import FilesGridSizeSelector from './filesGrid/FilesGridSizeSelector';
import FilesGridModeSelector from './filesGrid/FilesGridModeSelector';
import {valueToSizeTransformation} from './filesGrid/filesGridUtils';
import {ContentData, contentQueryHandlerByMode} from './ContentData';
import CMTopBar from './CMTopBar';
import CmSearchControlBar from './searchBar/CmSearchControlBar';
import {cmGoto} from './redux/actions';
import {connect} from 'react-redux';
import Constants from './constants';
import {setRefetcher, setContentListDataRefetcher, refetchContentTreeAndListData} from './refetches';
<<<<<<< HEAD
import {Folder, Refresh} from 'mdi-material-ui';
=======
>>>>>>> [BACKLOG-8987] - Change showTreeButton

const drawerWidth = 260;
const drawerPreviewWidth = 600;

const styles = theme => ({
    topBar: {
        color: theme.palette.primary.contrastText
    },
    previewOn: {
        color: theme.palette.primary.contrastText
    },
    previewOff: {
        color: theme.palette.text.secondary
    },
    paper: {
        backgroundColor: theme.palette.primary.contrastText
    },
    blockCore: {
        marginTop: -28,
        marginBottom: -2,
        marginLeft: -24
    },
    blockCoreSearch: {
        marginLeft: -17,
        marginTop: -28,
        backgroundColor: theme.palette.layout.dark,
        maxHeight: 31
    },
    breadCrumbs: {
    },
    buttons: {
        textAlign: 'right'
    },
    showTreeButton: {
        color: theme.palette.text.contrastText,
        marginRight: theme.spacing.unit / 2
    },
    refreshButton: {
	    color: theme.palette.text.contrastText,
        padding: 0
    },
    showTree: {
        textAlign: 'right !important'
    },
    drawerPaper: {
        backgroundColor: 'transparent',
        position: 'relative',
        width: drawerWidth
    },
    drawer: {
        width: drawerWidth,
        flexShrink: 0,
        whiteSpace: 'nowrap',
    },
    drawerOpen: {
        position: 'relative',
        width: drawerWidth,
        transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
        }),
    },
    drawerClose: {
        position: 'relative',

        transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }),
        overflowX: 'hidden',
        width: theme.spacing.unit * 7 + 1,
        [theme.breakpoints.up('sm')]: {
            width: theme.spacing.unit * 9 + 1,
        },
    },
    drawerPaperPreview: {
        backgroundColor: 'transparent',
        position: 'relative',
        width: drawerPreviewWidth
    },
    content: {
        flexGrow: 1,
        backgroundColor: theme.palette.background.default,
        transition: theme.transitions.create('margin', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen
        })
    },
    'content-left': {
        zIndex: '1500',
        marginLeft: 0,
    },
    'content-right': {
        marginRight: -drawerPreviewWidth
    },
    contentShift: {
        zIndex: '10000',
        transition: theme.transitions.create('margin', {
            easing: theme.transitions.easing.easeOut,
            duration: theme.transitions.duration.enteringScreen
        })
    },
    'contentShift-left': {
        marginLeft: 0
    },
    'contentShift-right': {
        marginRight: 0
    },
    root: {
        flexGrow: 1
    },
    appFrame: {
        zIndex: 0,
        overflow: 'hidden',
        position: 'relative',
        marginLeft: '-17px',
        display: 'flex',
        width: '100%'
    },
    searchClear: {
        maxHeight: 25,
        minHeight: 25,
        padding: '3px 7px'
    },
    searchClearButton: {
        color: theme.palette.text.contrastText,
    },
    searchClearIcon: {
        color: theme.palette.text.contrastText,
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
        fontSize: 12,
        marginRight: 50,
        fontFamily: 'Nunito Sans'
    },
    link: {
        color: 'inherit'
    }
});

const GRID_SIZE = 12;
const GRID_PANEL_BUTTONS_SIZE = 5;

class ContentLayout extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            open: true,
            open_view: false,
            anchor: 'left',
            filesGridSizeValue: 4,
            showList: false,
            page: 0,
            rowsPerPage: 25,
            order: 'ASC',
            orderBy: 'lastModified.value'
        };

        this.handleSort = this.handleSort.bind(this);
        this.handleDrawerOpen = this.handleDrawerOpen.bind(this);
        this.handleShowPreview = this.handleShowPreview.bind(this);
        this.handleChangePage = this.handleChangePage.bind(this);
        this.handleChangeRowsPerPage = this.handleChangeRowsPerPage.bind(this);
    }

    handleDrawerOpen() {
        if (this.state.open) {
            this.setState({open: false});
        } else {
            this.setState({open: true});
        }
    }

    // Force can be `show` or `hide`
    handleShowPreview(selection, force) {
        let {previewState, setPreviewState} = this.props;
        if (force !== undefined) {
            setPreviewState(force);
        } else if (!_.isEmpty(selection)) {
            switch (previewState) {
                case CM_PREVIEW_STATES.HIDE:
                    setPreviewState(CM_PREVIEW_STATES.SHOW);
                    break;
                default:
                    setPreviewState(CM_PREVIEW_STATES.HIDE);
            }
        }
    }

    handleChangePage(newPage) {
        this.setState({page: newPage});
    }

    handleChangeRowsPerPage(value) {
        if (value !== this.state.rowsPerPage) {
            this.setState({
                page: 0,
                rowsPerPage: value
            });
        }
    }

    setContentRefetcher(refetchingData) {
        setContentListDataRefetcher(refetchingData);
    }

    setTreeRefetcher(type) {
        return refetchingData => setRefetcher(type, refetchingData);
    }

    refreshContentsAndTree(contentTreeConfigs) {
        refetchContentTreeAndListData(contentTreeConfigs);
    }

    handleSort(order, orderBy) {
        this.setState({
            order: order,
            orderBy: orderBy
        });
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
        const {anchor, open_view, open, order, orderBy} = this.state;
        const {contentTreeConfigs, mode, selection, path, uiLang, lang, siteKey, previewState, searchTerms,
            searchContentType, sql2SearchFrom, sql2SearchWhere, clearSearch, classes, t} = this.props;
        let queryHandler = contentQueryHandlerByMode(mode);
        const layoutQuery = queryHandler.getQuery();
        const paginationState = {
            page: this.state.page,
            rowsPerPage: this.state.rowsPerPage
        };
        const rootPath = `/sites/${siteKey}`;
        const params = {
            searchContentType: searchContentType,
            searchTerms: searchTerms,
            sql2SearchFrom: sql2SearchFrom,
            sql2SearchWhere: sql2SearchWhere
        };

        const openHidden = open ? 'open' : 'hidden';
        const layoutQueryParams = queryHandler.getQueryParams(path, paginationState, uiLang, lang, params, rootPath, order, orderBy, openHidden);
        let contextualMenu = React.createRef();

        return (
            <DxContext.Consumer>{dxContext => {
            return (
                <React.Fragment>
                    <div className={classes.academyLink}>
                        <Trans
                            i18nKey="label.contentManager.link.academy"
                            components={[<a key="academyLink" href={contextJsParameters.config.academyLink} target="_blank" rel="noopener noreferrer" className={classes.link}>univers</a>]}
                    />
                </div>
                <Grid container spacing={0}>
                    <Grid item xs={GRID_SIZE} className={classes.topBar}>
                        <CMTopBar dxContext={dxContext} mode={mode}/>
                    </Grid>
                    <Grid container item xs={GRID_SIZE} direction="row" alignItems="center" className={this.isSearching() ? classes.blockCoreSearch : classes.blockCore}>
                        <Grid item xs={GRID_SIZE - GRID_PANEL_BUTTONS_SIZE}>
                            {this.isSearching() &&
                                <div className={classes.searchControl}>
                                    <CmSearchControlBar/>
                                </div>
                            }
                            </Grid>
                            <Grid item xs={GRID_PANEL_BUTTONS_SIZE} className={classes.showTree}>
                                {mode === Constants.mode.FILES &&
                                <FilesGridSizeSelector initValue={4} onChange={value => this.setState({filesGridSizeValue: value})}/>
                            }
                                {mode === Constants.mode.FILES &&
                                <FilesGridModeSelector showList={this.state.showList} onChange={() => this.setState(state => ({showList: !state.showList}))}/>
                            }
                            {this.isSearching() &&
                            <Button data-cm-role="search-clear" variant="text"
                                className={classes.searchClearButton}
                                classes={{sizeSmall: classes.searchClear}} onClick={() => clearSearch(params)}>
                                <Close className={classes.searchClearIcon}/>
                                {t('label.contentManager.search.clear')}
                            </Button>
                            }
                            </Grid>
                        </Grid>
                    </Grid>
                <div className={classes.appFrame}>
                    {this.isBrowsing() &&
                    <Drawer
			            variant="permanent"
			            anchor={anchor}
			            open={open}
			            className={classNames(classes.drawer, {
				            [classes.drawerOpen]: this.state.open,
				            [classes.drawerClose]: !this.state.open,
			            })}

                            classes={{
                                paper: classNames({
                                    [classes.drawerOpen]: this.state.open,
                                    [classes.drawerClose]: !this.state.open,
                                }),
                            }}>
                            <Paper elevation={2} style={{background: 'red!important'}}>
                                <ContentTrees
                                    contentTreeConfigs={contentTreeConfigs}
                                    openDrawer={this.handleDrawerOpen}
                                    isOpen={this.state.open}
                                    path={path}
                                    setRefetch={this.setTreeRefetcher}
                                />
                            </Paper>
                        </Drawer>
                        }
                        <ContextualMenu ref={contextualMenu} actionKey="contentTreeActions" context={{path: path}}/>
                        <main
                            className={classNames(classes.content, classes['content-left'], {
                                [classes.contentShift]: open,
                                [classes['contentShift-left']]: open,
                            }) ||
                            classNames(classes.content, classes['content-right'], {
                                [classes.contentShift]: open_view,
                                [classes['contentShift-right']]: open_view,
                            })}
                            onContextMenu={(event) => contextualMenu.current.open(event)}
                        >
                            <ContentData layoutQuery={layoutQuery}
                                         layoutQueryParams={layoutQueryParams}
                                         setRefetch={this.setContentRefetcher}
                                         orderBy={orderBy}
                                         treeShown={ open }>
                                {({rows, contentNotFound, totalCount}) => {
                                    return <Paper className={classes.paper}>{mode === Constants.mode.FILES && !this.state.showList
                                            ? <FilesGrid
                                                size={valueToSizeTransformation(this.state.filesGridSizeValue)}
                                                totalCount={totalCount}
                                                rows={rows}
                                                contentNotFound={contentNotFound}
                                                pageSize={this.state.rowsPerPage}
                                                page={this.state.page}
                                                handleShowPreview={() => this.handleShowPreview(selection, CM_PREVIEW_STATES.SHOW)}
                                                onChangePage={this.handleChangePage}
                                                onChangeRowsPerPage={this.handleChangeRowsPerPage}
                                            />
                                            : <ContentListTable
                                                totalCount={totalCount}
                                                rows={rows}
                                                contentNotFound={contentNotFound}
                                                pageSize={this.state.rowsPerPage}
                                                page={this.state.page}
                                                order={order}
                                                orderBy={orderBy}
                                                handleShowPreview={() => this.handleShowPreview(selection, CM_PREVIEW_STATES.SHOW)}
                                                handleSort={this.handleSort}
                                                onChangePage={this.handleChangePage}
                                                onChangeRowsPerPage={this.handleChangeRowsPerPage}
                                            />
                                        }
                                    </Paper>;
                                }}
                            </ContentData>
                        </main>
                        <PreviewDrawer
                            open={previewState === CM_PREVIEW_STATES.SHOW}
                            layoutQuery={layoutQuery}
                            layoutQueryParams={layoutQueryParams}
                            dxContext={dxContext}
                            onClose={() => this.handleShowPreview(selection, CM_PREVIEW_STATES.HIDE)}
                        />
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
        params: state.params,
        uiLang: state.uiLang,
        searchTerms: state.params.searchTerms,
        searchContentType: state.params.searchContentType,
        sql2SearchFrom: state.params.sql2SearchFrom,
        sql2SearchWhere: state.params.sql2SearchWhere
    };
};

const mapDispatchToProps = dispatch => ({
    setPath: (path, params) => dispatch(cmGoto(path, params)),
    setPreviewState: state => dispatch(cmSetPreviewState(state)),
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
