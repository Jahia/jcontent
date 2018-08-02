import React from 'react';
import {Query} from 'react-apollo';
import {BrowsingQueryHandler, SearchQueryHandler, Sql2SearchQueryHandler, FilesQueryHandler} from "./gqlQueries";
import * as _ from "lodash";
import ContentListTable from "./list/ContentListTable";
import ContentPreview from "./preview/ContentPreview";
import {Grid, IconButton, withStyles} from "@material-ui/core";
import {Visibility, VisibilityOff, List} from "@material-ui/icons";
import ContentTrees from "./ContentTrees";
import {withNotifications, ProgressOverlay} from '@jahia/react-material';
import {translate} from "react-i18next";
import ContentBreadcrumbs from "./breadcrumb/ContentBreadcrumbs";
import CmRouter from './CmRouter';

//Files grid
import FilesGrid from './filesGrid/FilesGrid';
import FilesGridSizeSelector from './filesGrid/FilesGridSizeSelector';
import { valueToSizeTransformation } from './filesGrid/filesGridUtils';

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
    }
});

const GRID_SIZE = 12;
const GRID_PANEL_BUTTONS_SIZE = 3;
const TREE_SIZE = 2;
const PREVIEW_SIZE = 6;



class ContentLayout extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            language: this.props.dxContext.lang,
            page: 0,
            rowsPerPage: 25,
            showTree: true,
            showPreview: false,
            selectedRow: null,
            filesGridSizeValue: 4
        };
    }

    handleChangePage = newPage => {
        this.setState({page: newPage});
    };

    handleChangeRowsPerPage = value => {
        this.setState({rowsPerPage: value});
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

    render() {
        const { showPreview, selectedRow, showTree: showTree } = this.state;
        const { contentSource, notificationContext, dxContext, t, classes } = this.props;
        const rootPath = '/sites/' + dxContext.siteKey;
        let queryHandler = contentQueryHandlerBySource[contentSource];

        return (<CmRouter render={({path, params, goto}) => {
            const layoutQuery = queryHandler.getQuery();
            const layoutQueryParams = queryHandler.getQueryParams(path, this.state, dxContext, params);
            let computedTableSize;

            return <Query fetchPolicy={'network-only'} query={layoutQuery} variables={layoutQueryParams}>
            { ({loading, error, data}) => {
                let rows = [];
                let totalCount = 0;
                if (error) {
                    console.log("Error when fetching data: " + error);
                    let message = t('label.contentManager.error.queryingContent', {details: (error.message ? error.message : '')});
                    notificationContext.notify(message, ['closeButton', 'noAutomaticClose']);
                } else {
                    notificationContext.closeNotification();
                    if (data && data.jcr && queryHandler.getResultsPath(data.jcr.results)) {
                        totalCount = queryHandler.getResultsPath(data.jcr.results).pageInfo.totalCount;
                        rows = _.map(queryHandler.getResultsPath(data.jcr.results).nodes, contentNode => {
                            return {
                                uuid: contentNode.uuid,
                                name: contentNode.displayName,
                                type: contentNode.primaryNodeType.displayName,
                                created: contentNode.created.value,
                                createdBy: contentNode.createdBy.value,
                                path: contentNode.path,
                                publicationStatus: contentNode.aggregatedPublicationInfo.publicationStatus,
                                isLocked: contentNode.lockOwner !== null,
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
                        computedTableSize = GRID_SIZE - (showTree ? TREE_SIZE : 0) - (showPreview ? PREVIEW_SIZE : 0);
                    }
                }
                return (
                    <div>
                        {loading && <ProgressOverlay/>}
                        <div className={classes.root}>
                            <Grid container spacing={ 0 }>
                                <Grid item xs={ GRID_SIZE - GRID_PANEL_BUTTONS_SIZE }>
                                    {(contentSource === "browsing" || contentSource === "files") && <ContentBreadcrumbs dxContext={dxContext}
                                                                                         lang={this.state.language}
                                                                                         rootPath={rootPath}/>}
                                </Grid>
                                <Grid item xs={ GRID_PANEL_BUTTONS_SIZE }>
                                    { contentSource === "files" && <FilesGridSizeSelector initValue={ 4 } onChange={ (value) => this.setState({ filesGridSizeValue: value })}/> }
                                    <IconButton onClick={this.handleShowTree}><List/></IconButton>
                                    { showPreview && <IconButton onClick={this.handleShowPreview}><VisibilityOff/></IconButton> }
                                    { !showPreview && <IconButton onClick={this.handleShowPreview}><Visibility/></IconButton> }
                                </Grid>
                            </Grid>
                            <Grid container spacing={0}>
                                {
                                    (contentSource === "browsing" || contentSource === "files") && showTree &&
                                    <Grid item xs={TREE_SIZE} className={ classes.tree }>
                                        {
                                            <ContentTrees path={path}
                                                          rootPath={rootPath}
                                                          lang={this.state.language}/>
                                        }
                                    </Grid>
                                }
                                <Grid item xs={computedTableSize} >
                                    {
                                        contentSource === "files" ?
                                            <FilesGrid size={ valueToSizeTransformation(this.state.filesGridSizeValue) }
                                                       totalCount={totalCount}
                                                       rows={rows}
                                                       pageSize={this.state.rowsPerPage}
                                                       onChangeRowsPerPage={this.handleChangeRowsPerPage}
                                                       onChangePage={this.handleChangePage}
                                                       onRowSelected={this.handleRowSelection}
                                                       page={this.state.page}
                                                       lang={this.state.language} /> :
                                            <ContentListTable
                                                totalCount={totalCount}
                                                rows={rows}
                                                pageSize={this.state.rowsPerPage}
                                                onChangeRowsPerPage={this.handleChangeRowsPerPage}
                                                onChangePage={this.handleChangePage}
                                                onRowSelected={this.handleRowSelection}
                                                page={this.state.page}
                                                lang={this.state.language}
                                            />
                                    }
                                </Grid>
                                {
                                    showPreview &&  <Grid item xs={PREVIEW_SIZE} className={classes.gridColumn}>
                                        <ContentPreview selection={ selectedRow }
                                                        layoutQuery={ layoutQuery }
                                                        layoutQueryParams={layoutQueryParams}
                                                        rowSelectionFunc={ this.handleRowSelection }/>
                                    </Grid>
                                }
                            </Grid>
                        </div>
                    </div>
                )
            }}
        </Query>}}/>);
    }
}

ContentLayout = _.flowRight(
    withNotifications(),
    translate(),
    withStyles(styles)
)(ContentLayout);

export {ContentLayout};