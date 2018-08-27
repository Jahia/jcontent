import React from 'react';
import {Query, withApollo} from 'react-apollo';
import {BrowsingQueryHandler, SearchQueryHandler, Sql2SearchQueryHandler, FilesQueryHandler, GetNodeAndChildrenByPathQuery} from "./gqlQueries";
import * as _ from "lodash";
import ContentListTable from "./list/ContentListTable";
import ContentPreview from "./preview/ContentPreview";
import PreviewDrawer from "./preview/PreviewDrawer";
import {Grid, IconButton, withStyles} from "@material-ui/core";
import {Visibility, VisibilityOff, List, Add} from "@material-ui/icons";
import ContentTrees from "./ContentTrees";
import {withNotifications, ProgressOverlay} from '@jahia/react-material';
import {translate} from "react-i18next";
import ContentBreadcrumbs from "./breadcrumb/ContentBreadcrumbs";
import CmRouter from './CmRouter';
import {DxContext} from "./DxContext";
import Actions from "./Actions";
import CmButton from "./renderAction/CmButton";
import {register as gwtEventHandlerRegister, unregister as gwtEventHandlerUnregister} from "./eventHandlerRegistry";

//Files grid
import FilesGrid from './filesGrid/FilesGrid';
import FilesGridSizeSelector from './filesGrid/FilesGridSizeSelector';
import FilesGridModeSelector from './filesGrid/FilesGridModeSelector';
import {valueToSizeTransformation} from './filesGrid/filesGridUtils';

const contentQueryHandlerBySource = {
    "browsing": new BrowsingQueryHandler(),
    "files": new FilesQueryHandler(),
    "search": new SearchQueryHandler(),
    "sql2Search": new Sql2SearchQueryHandler()
};

const styles = theme => ({
    root: {
        flexGrow: 1
    },
    gridColumn: { //Make it possible for content to expand height to 100%
        display: "flex",
        flexDirection: "column"
    },
    tree: {
        overflowX: "auto"
    },
    buttonPanel : {
      display: "flex",
      justifyContent: "center",
      alignItems: "center"
    }
});

const GRID_SIZE = 12;
const GRID_PANEL_BUTTONS_SIZE = 3;
const TREE_SIZE = 3;

class ContentLayout extends React.Component {

    constructor(props) {

        super(props);

        this.state = {
            page: 0,
            rowsPerPage: 25,
            showTree: true,
            showPreview: false,
            selectedRow: null,
            filesGridSizeValue: 4,
            showList: false
        };

        this.onGwtContentCreate = this.onGwtContentCreate.bind(this);
        this.onGwtContentUpdate = this.onGwtContentUpdate.bind(this);
    }

    handleChangePage = newPage => {
        this.setState({page: newPage});
    };

    handleChangeRowsPerPage = value => {
        this.setState({
            page: 0,
            rowsPerPage: value
        });
    };

    handleShowTree = () => {
        this.setState((prevState, props) => {
            return {
                showTree: !prevState.showTree
            }
        })
    };

    handleShowPreview = () => {
        if (this.state.selectedRow) {
            this.setState((prevState, props) => {
                return {
                    showPreview: !prevState.showPreview
                }
            })
        }
    };

    handleRowSelection = (row) => {
        //Remove selection and close preview panel if it is open
        if (this.state.selectedRow && row.path === this.state.selectedRow.path) {
            this.setState({
                selectedRow: null,
                showPreview: this.state.showPreview ? false : this.state.showPreview
            });
        }
        //Store selection
        else {
            this.setState({
                selectedRow: row
            });
        }
    };

    componentDidMount() {
        gwtEventHandlerRegister("updateButtonItemEventHandlers", this.onGwtContentUpdate);
        gwtEventHandlerRegister("createButtonItemEventHandlers", this.onGwtContentCreate);
    }

    componentWillUnmount() {
        gwtEventHandlerUnregister("updateButtonItemEventHandlers", this.onGwtContentUpdate);
        gwtEventHandlerUnregister("createButtonItemEventHandlers", this.onGwtContentCreate);
    }

    onGwtContentCreate(enginePath, engineNodeName, uuid) {
        this.onGwtContentSave(enginePath, engineNodeName, uuid, true);
    }

    onGwtContentUpdate(enginePath, engineNodeName, uuid) {
        this.onGwtContentSave(enginePath, engineNodeName, uuid, false);
    }

    onGwtContentSave(enginePath, engineNodeName, uuid, forceRefresh) {
        // clean up the cache entry
        const path = enginePath.substring(0, enginePath.lastIndexOf("/") + 1) + engineNodeName;
        if (enginePath === this.gwtEventHandlerContext.path && enginePath !== path) {
            this.gwtEventHandlerContext.goto(path, this.gwtEventHandlerContext.params);
        } else {
            // update the parent node to update the current node data (needed for add / remove / move etc ..
            // TODO: do not call forceCMUpdate() but let the application update by itself ( BACKLOG-8369 )
            this.props.client.query({
                query: GetNodeAndChildrenByPathQuery,
                fetchPolicy: "network-only",
                variables: {
                    "path": path.substring(0, path.lastIndexOf("/")),
                    "language": this.gwtEventHandlerContext.dxContext.lang,
                    "displayLanguage": this.gwtEventHandlerContext.dxContext.uilang
                }
            }).then(forceRefresh && window.forceCMUpdate());
        }
    }

    isBrowsing() {
        let {contentSource} = this.props;
        return (contentSource === "browsing" || contentSource === "files")
    }

    render() {

        const {showPreview, selectedRow, showTree: showTree} = this.state;
        const {contentSource, notificationContext, t, classes, client} = this.props;

        return <DxContext.Consumer>{dxContext => {
            const rootPath = '/sites/' + dxContext.siteKey;
            let queryHandler = contentQueryHandlerBySource[contentSource];
            return <CmRouter render={({path, params, goto}) => {

                this.gwtEventHandlerContext = {
                    path: path,
                    params: params,
                    goto: goto,
                    dxContext: dxContext
                };

                const layoutQuery = queryHandler.getQuery();
                const layoutQueryParams = queryHandler.getQueryParams(path, this.state, dxContext, params);
                let computedTableSize;

                return <Query query={layoutQuery} variables={layoutQueryParams}>
                    {({loading, error, data}) => {

                        if (loading) {
                            return <ProgressOverlay/>
                        }

                        if (error) {
                            console.log("Error when fetching data: " + error);
                            let message = t('label.contentManager.error.queryingContent', {details: (error.message ? error.message : '')});
                            notificationContext.notify(message, ['closeButton', 'noAutomaticClose']);
                            return null;
                        }

                        let rows = [];
                        let totalCount = 0;
                        notificationContext.closeNotification();

                        if (data && data.jcr) {
                            let result = queryHandler.getResultsPath(data.jcr.results);
                            totalCount = result.pageInfo.totalCount;
                            rows = _.map(result.nodes, contentNode => {
                                return {
                                    uuid: contentNode.uuid,
                                    name: contentNode.displayName,
                                    type: contentNode.primaryNodeType.displayName,
                                    created: contentNode.created.value,
                                    createdBy: contentNode.createdBy.value,
                                    path: contentNode.path,
                                    publicationStatus: contentNode.aggregatedPublicationInfo.publicationStatus,
                                    isLocked: contentNode.lockOwner !== null,
                                    lockOwner: contentNode.lockOwner !== null ? contentNode.lockOwner.value : '',
                                    lastPublishedBy: (contentNode.lastPublishedBy !== null ? contentNode.lastPublishedBy.value : ''),
                                    lastPublished: (contentNode.lastPublished !== null ? contentNode.lastPublished.value : ''),
                                    lastModifiedBy: (contentNode.lastModifiedBy !== null ? contentNode.lastModifiedBy.value : ''),
                                    lastModified: (contentNode.lastModified !== null ? contentNode.lastModified.value : ''),
                                    deletedBy: (contentNode.deletedBy !== null ? contentNode.deletedBy.value : ''),
                                    deleted: (contentNode.deleted !== null ? contentNode.deleted.value : ''),
                                    wipStatus: (contentNode.wipStatus != null ? contentNode.wipStatus.value : ''),
                                    wipLangs: (contentNode.wipLangs != null ? contentNode.wipLangs.values : []),
                                    icon: contentNode.primaryNodeType.icon,
                                    isSelected: selectedRow ? selectedRow.path === contentNode.path : false,
                                    width: (contentNode.width != null ? contentNode.width.value : ''),
                                    height: (contentNode.width != null ? contentNode.height.value : '')
                                }
                            });
                            computedTableSize = GRID_SIZE - (this.isBrowsing() && showTree ? TREE_SIZE : 0)
                        }

                        return (
                            <div>
                                <div className={classes.root}>
                                    <Grid container spacing={0}>
                                        <Grid item xs={GRID_SIZE - GRID_PANEL_BUTTONS_SIZE}>
                                            <ContentBreadcrumbs dxContext={dxContext} lang={dxContext.lang} rootPath={rootPath}/>
                                        </Grid>
                                        <Grid item xs={GRID_PANEL_BUTTONS_SIZE} className={classes.buttonPanel}>
                                            {this.isBrowsing() && path != rootPath &&
                                                <Actions menuId={"createMenu"} context={{path: path}}>
                                                    {(props) => <CmButton {...props}><Add/></CmButton>}
                                                </Actions>
                                            }
                                            {this.isBrowsing() &&
                                                <IconButton onClick={this.handleShowTree}><List/></IconButton>
                                            }
                                            {contentSource === "files" &&
                                                <FilesGridModeSelector showList={this.state.showList} onChange={() => this.setState({showList: !this.state.showList})}/>
                                            }
                                            {showPreview &&
                                                <IconButton onClick={this.handleShowPreview}><VisibilityOff/></IconButton>
                                            }
                                            {!showPreview &&
                                                <IconButton onClick={this.handleShowPreview}><Visibility/></IconButton>
                                            }
                                            {contentSource === "files" &&
                                                <FilesGridSizeSelector initValue={4} onChange={(value) => this.setState({filesGridSizeValue: value})}/>
                                            }
                                        </Grid>
                                    </Grid>
                                    <Grid container spacing={0}>
                                        {this.isBrowsing() && showTree &&
                                            <Grid item xs={TREE_SIZE} className={classes.tree}>
                                                <ContentTrees path={path} rootPath={rootPath} lang={dxContext.lang} user={dxContext.userName}/>
                                            </Grid>
                                        }
                                        <Grid item xs={computedTableSize}>
                                            {contentSource === "files" && !this.state.showList ?
                                                <FilesGrid
                                                    size={valueToSizeTransformation(this.state.filesGridSizeValue)}
                                                    totalCount={totalCount}
                                                    rows={rows}
                                                    pageSize={this.state.rowsPerPage}
                                                    onChangeRowsPerPage={this.handleChangeRowsPerPage}
                                                    onChangePage={this.handleChangePage}
                                                    onRowSelected={this.handleRowSelection}
                                                    page={this.state.page}
                                                    lang={dxContext.lang}
                                                /> : <ContentListTable
                                                    totalCount={totalCount}
                                                    rows={rows}
                                                    pageSize={this.state.rowsPerPage}
                                                    onChangeRowsPerPage={this.handleChangeRowsPerPage}
                                                    onChangePage={this.handleChangePage}
                                                    onRowSelected={this.handleRowSelection}
                                                    page={this.state.page}
                                                    lang={dxContext.lang}
                                                />
                                            }
                                        </Grid>
                                    </Grid>
                                    <PreviewDrawer open={ showPreview } onClose={this.handleShowPreview}>
                                        {/*Always get row from query not from state to be up to date*/}
                                        <ContentPreview selection={rows.find((row) => { return selectedRow !== null && row.path === selectedRow.path})}
                                                        layoutQuery={layoutQuery}
                                                        layoutQueryParams={layoutQueryParams}
                                                        rowSelectionFunc={this.handleRowSelection}
                                                        dxContext={dxContext}/>
                                    </PreviewDrawer>
                                </div>
                            </div>
                        );
                    }}
                </Query>
            }}/>
        }}</DxContext.Consumer>;
    }
}

ContentLayout = _.flowRight(
    withNotifications(),
    translate(),
    withStyles(styles),
    withApollo
)(ContentLayout);

export {ContentLayout};