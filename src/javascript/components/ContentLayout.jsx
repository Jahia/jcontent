import React from 'react';
import {withApollo} from 'react-apollo';
import * as _ from "lodash";
import ContentListTable from "./list/ContentListTable";
import PreviewDrawer from "./preview/PreviewDrawer";
import {Grid, Button, Paper, withStyles, Drawer} from "@material-ui/core";
import {Add, Close} from "@material-ui/icons";
import classNames from 'classnames'
import ContentTrees from "./ContentTrees";
import {withNotifications} from '@jahia/react-material';
import {translate} from "react-i18next";
import ContentBreadcrumbs from "./breadcrumb/ContentBreadcrumbs";
import {DxContext} from "./DxContext";
import Actions from "./Actions";
import CmButton from "./renderAction/CmButton";
import Upload from './fileupload/upload';
import {cmSetPreviewState, CM_PREVIEW_STATES} from "./redux/actions";
import FilesGrid from './filesGrid/FilesGrid';
import FilesGridSizeSelector from './filesGrid/FilesGridSizeSelector';
import FilesGridModeSelector from './filesGrid/FilesGridModeSelector';
import {valueToSizeTransformation} from './filesGrid/filesGridUtils';
import {ContentData, contentQueryHandlerByMode} from "./ContentData";
import CMTopBar from "./CMTopBar";
import CmSearchControlBar from "./CmSearchControlBar";
import {cmGoto} from "./redux/actions";
import {connect} from "react-redux";
import Constants from "./constants";
import {setRefetcher, setContentListDataRefetcher, refetchContentTreeAndListData} from './refetches';
import ContextualMenu from './contextualMenu/contextualMenu';
import PasteActionButton from './copyPaste/PasteActionButton';
import Icon from "./icons/Icon";

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
        marginLeft: -24,
    },
    blockCoreSearch: {
        marginLeft: -17,
        marginTop: -28,
        backgroundColor: "#44464a",
        maxHeight: 31
    },
    breadCrumbs: {},
    buttons: {
        textAlign: 'right'
    },
    showTreeButton: {
        color: '#eaeaea',
        padding: '0 5 0 0',
    },
    refreshButton: {
        color: '#eaeaea',
        padding: 0,
    },
    showTree: {
        textAlign: 'right !important'
    },
    drawerPaper: {
        backgroundColor: 'transparent',
        position: 'relative',
        width: drawerWidth
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
        }),
    },
    'content-left': {
        marginLeft: -drawerWidth
    },
    'content-right': {
        marginRight: -drawerPreviewWidth
    },
    contentShift: {
        transition: theme.transitions.create('margin', {
            easing: theme.transitions.easing.easeOut,
            duration: theme.transitions.duration.enteringScreen
        }),
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
    ButtonAction: {
        margin: '0 !important'
    },
    searchClear: {
        maxHeight: 25,
        minHeight: 25,
        padding: '3px 7px',
    },
    searchClearButton: {
        color: '#eaeaea'
    },
    searchClearIcon: {
        color: '#d4d9dd'
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
            showTree: true,
            filesGridSizeValue: 4,
            showList: false,
            page: 0,
            rowsPerPage: 25,
            order: 'ASC',
            orderBy: 'lastModified.value',
        };

        this.handleSort = this.handleSort.bind(this);
    }

    handleDrawerOpen = () => {
        if (this.state.open) {
            this.setState({open: false});
        } else {
            this.setState({open: true});
        }
    };

    //Force can be `show` or `hide`
    handleShowPreview = (selection, force) => {
        let {previewState, setPreviewState} = this.props;
        if (force !== undefined) {
            setPreviewState(force);
        } else if (!_.isEmpty(selection)) {
            switch (previewState) {
                case CM_PREVIEW_STATES.SHOW:
                    setPreviewState(CM_PREVIEW_STATES.HIDE);
                    break;
                case CM_PREVIEW_STATES.HIDE: {
                    setPreviewState(CM_PREVIEW_STATES.SHOW);
                    break;
                }
            }
        }
    };

    handleChangePage = newPage => {
        this.setState({page: newPage});
    };

    handleChangeRowsPerPage = value => {
        if (value != this.state.rowsPerPage) {
            this.setState({
                page: 0,
                rowsPerPage: value
            });
        }
    };

    setContentRefetcher = refetchingData => {
        setContentListDataRefetcher(refetchingData);
    };

    setTreeRefetcher = type => {
        return (refetchingData) => setRefetcher(type, refetchingData);
    };

    refreshContentsAndTree() {
        refetchContentTreeAndListData();
    }

    handleSort(order, orderBy){
        this.setState({
            order: order,
            orderBy: orderBy,
        });
    }

    isBrowsing() {
        let {mode} = this.props;
        return (mode === Constants.mode.BROWSE || mode === Constants.mode.FILES);
    };

    isSearching() {
        let {mode} = this.props;
        return (mode === Constants.mode.SEARCH || mode === Constants.mode.SQL2SEARCH);
    };

    isRootNode() {
        let {path, siteKey} = this.props;
        return (path === ("/sites/" + siteKey));
    };

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
        const layoutQueryParams = queryHandler.getQueryParams(path, paginationState, uiLang, lang, params, rootPath, order, orderBy);

        return <DxContext.Consumer>{dxContext => {
            return <React.Fragment>
                <Grid container spacing={0}>
                    <Grid item xs={GRID_SIZE} className={classes.topBar}>
                        <CMTopBar dxContext={dxContext} mode={mode}/>
                    </Grid>
                    <Grid container item xs={GRID_SIZE} direction="row" alignItems="center" className={this.isSearching() ? classes.blockCoreSearch : classes.blockCore}>
                        <Grid item xs={GRID_SIZE - GRID_PANEL_BUTTONS_SIZE}>
                            {this.isBrowsing() &&
                                <div className={classes.breadCrumbs}>
                                    <ContentBreadcrumbs mode={this.props.mode}/>
                                </div>
                            }
                            {this.isSearching() &&
                                <div className={classes.searchControl}>
                                    <CmSearchControlBar/>
                                </div>
                            }
                        </Grid>
                        <Grid item xs={GRID_PANEL_BUTTONS_SIZE} className={classes.showTree}>
                            {mode === Constants.mode.FILES &&
                                <FilesGridSizeSelector initValue={4} onChange={(value) => this.setState({filesGridSizeValue: value})}/>
                            }
                            {mode === Constants.mode.FILES &&
                                <FilesGridModeSelector showList={this.state.showList} onChange={() => this.setState({showList: !this.state.showList})}/>
                            }
                            {this.isBrowsing() && !this.isRootNode() &&
                                <React.Fragment>
                                    <PasteActionButton path={ path } buttonClass={ classes.ButtonAction }/>
                                    <Actions menuId={"createMenu"} context={{path: path}} className={classes.ButtonAction}>
                                        {(props) => <CmButton text={true} {...props}><Add/></CmButton>}
                                    </Actions>
                                </React.Fragment>
                            }
                            {this.isBrowsing() &&
                                <Button variant="text" className={classes.showTreeButton} onClick={this.handleDrawerOpen}>
                                    <Icon name={'folder'} fill={'#d4d9dd'}/>
                                    {t("label.contentManager.tree." + (open ? "hide" : "show"))}
                                </Button>
                            }
                            <Button variant="text" className={classes.refreshButton} onClick={() => this.refreshContentsAndTree(contentTreeConfigs)}>
                                <Icon name={'refresh'} fill={'#d4d9dd'}/>
                                {t(this.isSearching() ? "label.contentManager.search.refresh" : "label.contentManager.refresh")}
                            </Button>
                            {this.isSearching() &&
                                <Button data-cm-role="search-clear" variant={"text"}
                                        className={classes.searchClearButton}
                                        classes={{sizeSmall: classes.searchClear}} onClick={() => clearSearch(params)}>
                                    <Close className={classes.searchClearIcon}/>
                                    {t("label.contentManager.search.clear")}
                                </Button>
                            }
                        </Grid>
                    </Grid>
                </Grid>
                <div className={classes.appFrame}>
                    {this.isBrowsing() &&
                        <Paper style={{background: '#f5f5f5'}}>
                            <Drawer
                                variant="persistent"
                                anchor={anchor}
                                open={open}
                                classes={{
                                    paper: classes.drawerPaper,
                                }}
                            >
                                <ContentTrees
                                    contentTreeConfigs={contentTreeConfigs}
                                    path={path}
                                    setRefetch={this.setTreeRefetcher}
                                />
                            </Drawer>
                        </Paper>
                    }
                    <main
                        className={classNames(classes.content, classes[`content-left`], {
                            [classes.contentShift]: open,
                            [classes[`contentShift-left`]]: open,
                        }) ||
                        classNames(classes.content, classes[`content-right`], {
                            [classes.contentShift]: open_view,
                            [classes[`contentShift-right`]]: open_view,
                        })}
                    >
                        <ContentData layoutQuery={layoutQuery} layoutQueryParams={layoutQueryParams}
                                     setRefetch={this.setContentRefetcher} orderBy={orderBy}>
                            {({rows, totalCount}) => {
                                return <Paper className={classes.paper}>
                                    {mode === Constants.mode.FILES && !this.state.showList
                                        ? <FilesGrid
                                            size={valueToSizeTransformation(this.state.filesGridSizeValue)}
                                            totalCount={totalCount}
                                            rows={rows}
                                            pageSize={this.state.rowsPerPage}
                                            onChangeRowsPerPage={this.handleChangeRowsPerPage}
                                            onChangePage={this.handleChangePage}
                                            page={this.state.page}
                                            handleShowPreview={() => this.handleShowPreview(selection, CM_PREVIEW_STATES.SHOW)}
                                        />
                                        : <ContentListTable
                                            totalCount={totalCount}
                                            rows={rows}
                                            pageSize={this.state.rowsPerPage}
                                            onChangeRowsPerPage={this.handleChangeRowsPerPage}
                                            onChangePage={this.handleChangePage}
                                            page={this.state.page}
                                            handleShowPreview={() => this.handleShowPreview(selection, CM_PREVIEW_STATES.SHOW)}
                                            handleSort={this.handleSort}
                                            order={order}
                                            orderBy={orderBy}
                                        />
                                    }
                                </Paper>
                            }}
                        </ContentData>
                    </main>
                    <PreviewDrawer
                        open={previewState === CM_PREVIEW_STATES.SHOW}
                        onClose={() => this.handleShowPreview(selection, CM_PREVIEW_STATES.HIDE)}
                        layoutQuery={layoutQuery}
                        layoutQueryParams={layoutQueryParams}
                        dxContext={dxContext}
                    />
                </div>

                <Upload uploadUpdateCallback={(status) => {
                    if (status && status.uploading === 0) {
                        this.refreshContentsAndTree(contentTreeConfigs)
                    }
                }}/>

                <ContextualMenu/>

            </React.Fragment>
        }}</DxContext.Consumer>;
    }
}

const mapStateToProps = (state) => {
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
    }
};

const mapDispatchToProps = (dispatch, ownProps) => ({
    setPath: (path, params) => dispatch(cmGoto(path, params)),
    setPreviewState: (state) => dispatch(cmSetPreviewState(state)),
    clearSearch: (params) => {
        params = _.clone(params);
        _.unset(params, "searchContentType");
        _.unset(params, "searchTerms");
        _.unset(params, "sql2SearchFrom");
        _.unset(params, "sql2SearchWhere");
        dispatch(cmGoto({mode: "browse", params: params}))
    }
});

ContentLayout = _.flowRight(
    withNotifications(),
    translate(),
    withStyles(styles),
    withApollo,
    connect(mapStateToProps, mapDispatchToProps)
)(ContentLayout);

export {ContentLayout};