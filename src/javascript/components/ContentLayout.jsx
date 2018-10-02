import React from 'react';
import {withApollo} from 'react-apollo';
import {ApolloProvider} from "react-apollo";
import * as _ from "lodash";
import ContentListTable from "./list/ContentListTable";
import ContentPreview from "./preview/ContentPreview";
import PreviewDrawer from "./preview/PreviewDrawer";
import {Grid, Button, Paper, withStyles, Drawer, Menu} from "@material-ui/core";
import {Add} from "@material-ui/icons";
import classNames from 'classnames'
import ContentTrees from "./ContentTrees";
import {withNotifications} from '@jahia/react-material';
import {translate, I18nextProvider} from "react-i18next";
import ContentBreadcrumbs from "./breadcrumb/ContentBreadcrumbs";
import {DxContext} from "./DxContext";
import Actions from "./Actions";
import CmButton from "./renderAction/CmButton";
import CmMenuItem from "./renderAction/CmMenuItem";
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
import constants from "./constants";
import { setRefetcher, triggerRefetch, refetchTypes } from './refetches';
import ReactDOM  from 'react-dom';
import {client} from "@jahia/apollo-dx/index";

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
        backgroundColor: theme.palette.primary.contrastText,
        // marginLeft: -24
    },
    blockCore: {
        marginTop: -28,
        marginBottom: -2,
    },
    blockCoreSearch: {
        marginTop: -28,
        marginBottom: -2,
        backgroundColor: "orange"
    },
    breadCrumbs: {
        marginLeft: -24

    },
    breadCrumbs: {},
    buttons: {
        textAlign: 'right',
    },
    showTreeButton: {
        color: 'pink'
    },
    drawerPaper: {
        backgroundColor: 'transparent',
        position: 'relative',
        width: drawerWidth,
    },
    drawerPaperPreview: {
        backgroundColor: 'transparent',
        position: 'relative',
        width: drawerPreviewWidth,
    },
    content: {
        flexGrow: 1,
        backgroundColor: theme.palette.background.default,
        transition: theme.transitions.create('margin', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }),
    },
    'content-left': {
        marginLeft: -drawerWidth,
    },
    'content-right': {
        marginRight: -drawerPreviewWidth,
    },
    contentShift: {
        transition: theme.transitions.create('margin', {
            easing: theme.transitions.easing.easeOut,
            duration: theme.transitions.duration.enteringScreen,
        }),
    },
    'contentShift-left': {
        marginLeft: 0,
    },
    'contentShift-right': {
        marginRight: 0,
    },
    root: {
        flexGrow: 1,

    },
    appFrame: {
        zIndex: 0,
        overflow: 'hidden',
        position: 'relative',
        marginLeft: '-17px',
        display: 'flex',
        width: '100%'

    },
    contextualMenu: {
        position: "absolute",
        top: "-150px",
        left: "-150px",
        zIndex:1000
    }
});

const GRID_SIZE = 12;
const GRID_PANEL_BUTTONS_SIZE = 4;

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
            rowsPerPage: 25
        };

    }

    handleDrawerOpen = () => {
        if (this.state.open) {
            this.setState({open: false});
        }
        else {
            this.setState({open: true});

        }
    };

    handleDrawerViewOpen = () => {
        this.setState({open_view: true});
    };

    handleDrawerOpenView = () => {
        this.setState({open_view: true, open: false});
    };

    handleDrawerCloseView = () => {
        this.setState({open_view: false});
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
        setRefetcher(refetchTypes.CONTENT_DATA, refetchingData);
    };

    setTreeRefetcher = type => {
        return (refetchingData) => setRefetcher(type, refetchingData);
    };

    isBrowsing() {
        let {mode} = this.props;
        return (mode === constants.mode.BROWSE || mode === constants.mode.FILES)
    };

    isSearching() {
        let {mode} = this.props;
        return (mode === constants.mode.SEARCH || mode === constants.mode.SQL2SEARCH)
    };

    isRootNode() {
        let {path, siteKey} = this.props;
        return (path === ("/sites/" + siteKey))
    };

    render() {
        const {anchor, open_view, open} = this.state;
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
        const layoutQueryParams = queryHandler.getQueryParams(path, paginationState, uiLang, lang, params, rootPath);
        return <DxContext.Consumer>{dxContext => {
            return <React.Fragment>
                <div id={"floatingContextualMenu"} className={classes.contextualMenu}></div>
                <Grid container spacing={0}>
                    <Grid item xs={GRID_SIZE} className={classes.topBar}>
                        <CMTopBar dxContext={dxContext} mode={mode}/>
                    </Grid>
                    <Grid container item xs={GRID_SIZE} direction="row" alignItems="center"
                          className={this.isSearching() ? classes.blockCoreSearch : classes.blockCore}>
                        <Grid item xs={GRID_SIZE - GRID_PANEL_BUTTONS_SIZE}>
                            {this.isBrowsing() &&
                            <div className={classes.breadCrumbs}>
                                <ContentBreadcrumbs/>
                            </div>
                            }
                            {this.isSearching() &&
                            <div className={classes.searchControl}>
                                <CmSearchControlBar/>
                            </div>
                            }
                        </Grid>
                        <Grid item xs={GRID_PANEL_BUTTONS_SIZE} className={classes.showTree}>
                            {this.isBrowsing() && !this.isRootNode() &&
                            <Actions menuId={"createMenu"} context={{path: path}}>
                                {(props) => <CmButton {...props}><Add/></CmButton>}
                            </Actions>
                            }
                            {this.isBrowsing() &&
                            <Button variant="text" className={classes.showTreeButton} onClick={this.handleDrawerOpen}>
                                {t("label.contentManager.tree." + (open ? "hide" : "show"))}
                            </Button>}

                            <Button variant="text" className={classes.showTreeButton} onClick={() => {
                                    triggerRefetch(refetchTypes.CONTENT_DATA);
                                    contentTreeConfigs.forEach((config) => {
                                        triggerRefetch(config.key);
                                    });
                                }
                            }>
                                {t("label.contentManager.refresh")}
                            </Button>

                            {mode === constants.mode.FILES &&
                            <FilesGridModeSelector showList={this.state.showList}
                                                   onChange={() => this.setState({showList: !this.state.showList})}/>
                            }
                            {mode === constants.mode.FILES &&
                            <React.Fragment>
                                <FilesGridModeSelector showList={this.state.showList}
                                                       onChange={() => this.setState({showList: !this.state.showList})}/>
                                <FilesGridSizeSelector initValue={4}
                                                       onChange={(value) => this.setState({filesGridSizeValue: value})}/>
                            </React.Fragment>
                            }
                            {this.isSearching() &&
                            <Button data-cm-role="search-clear" variant={"contained"} size={"small"} onClick={() => clearSearch(params)}>
                                {t("label.contentManager.search.clear")}
                            </Button>
                            }
                        </Grid>
                    </Grid>
                </Grid>
                <div className={classes.appFrame}>
                    {this.isBrowsing() && <Paper style={{background: '#f5f5f5'}}>
                        <Drawer
                            variant="persistent"
                            anchor={anchor}
                            open={open}
                            classes={{
                                paper: classes.drawerPaper,
                            }}>
                            <ContentTrees
                                contentTreeConfigs={contentTreeConfigs}
                                path={path}
                                setRefetch={ this.setTreeRefetcher }
                                displayContextualMenu={(...rest) => this.contextualMenu(dxContext, ...rest)}
                            />
                        </Drawer>
                    </Paper>}
                    <main
                        className={classNames(classes.content, classes[`content-left`], {
                            [classes.contentShift]: open,
                            [classes[`contentShift-left`]]: open,
                        }) ||
                        classNames(classes.content, classes[`content-right`], {
                            [classes.contentShift]: open_view,
                            [classes[`contentShift-right`]]: open_view,
                        })
                        }>
                        <ContentData layoutQuery={layoutQuery}
                                     layoutQueryParams={layoutQueryParams}
                                     setRefetch={ this.setContentRefetcher }>
                            {({rows, totalCount}) => {
                                return <Paper className={classes.paper}>
                                    {mode === constants.mode.FILES && !this.state.showList
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
                                            displayContextualMenu={(...rest) => this.contextualMenu(dxContext, ...rest)}
                                        />
                                    }
                                </Paper>
                            }}
                        </ContentData>
                    </main>
                    <PreviewDrawer open={previewState === CM_PREVIEW_STATES.SHOW}
                                   onClose={() => this.handleShowPreview(selection, CM_PREVIEW_STATES.HIDE)}>
                        {/*Always get row from query not from state to be up to date*/}
                        <ContentPreview
                            layoutQuery={layoutQuery}
                            layoutQueryParams={layoutQueryParams}
                            dxContext={dxContext}
                        />
                    </PreviewDrawer>
                </div>

                <Upload/>

            </React.Fragment>
        }}</DxContext.Consumer>;
    }

    contextualMenu = (dxContext, event, path, uuid, displayName, lang, nodeName) => {
        event.preventDefault();
        let {i18n, store} = this.props;
        let el = document.getElementById("floatingContextualMenu");
        if (el != null) {
            let contextualMenuComponent = <Menu
                data-cm-role={'contextual-menu-action'}
                anchorEl={el}
                open={true}
                onClose={() => {ReactDOM.unmountComponentAtNode(el);}}>
                <Actions store={store} menuId={"contextualMenuAction"} context={{
                    uuid: uuid,
                    path: path,
                    displayName: displayName,
                    lang: lang,
                    nodeName: nodeName
                }}>{(props) => {
                    return <CmMenuItem {...props} menuClose={()=>{ReactDOM.unmountComponentAtNode(el);}}/>
                }}
                </Actions>;
            </Menu>;

            ReactDOM.render(<ApolloProvider client={client({contextPath: dxContext.contextPath, useBatch:true, httpOptions:{batchMax:50}})}>
                    <I18nextProvider i18n={ i18n }>
                        {contextualMenuComponent}
                    </I18nextProvider>
                </ApolloProvider>, el);
            el.style.top = (event.screenY-85) + "px";
            el.style.left = event.screenX + "px";
        }
    }
}

const mapStateToProps = (state, ownProps) => {
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
        sql2SearchWhere: state.params.sql2SearchWhere,
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