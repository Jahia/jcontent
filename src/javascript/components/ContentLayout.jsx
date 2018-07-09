import React from 'react';
import {Query} from 'react-apollo';
import {allContentQuery, TableQueryVariables} from "./gqlQueries";
import * as _ from "lodash";
import ContentListTable from "./list/ContentListTable";
import ContentPreview from "./ContentPreview";
import {Grid, Button, withStyles} from "@material-ui/core";
import ContentBrowser from "./ContentBrowser";
import {withNotifications, ProgressOverlay} from '@jahia/react-material';
import {translate} from "react-i18next";
import ContentBreadcrumbs from "./ContentBreadcrumbs";
import CmRouter from './CmRouter'

const styles = theme => ({
    root: {
        flexGrow: 1
    },
    gridColumn: { //Make it possible for content to expand height to 100%
        display: "flex",
        flexDirection: "column"
    }
});

const GRID_SIZE = 12;
const TREE_SIZE = 2;
const PREVIEW_SIZE = 6;

class ContentLayout extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            language: this.props.lang,
            page: 0,
            rowsPerPage: 10,
            showBrowser: false,
            showPreview: false,
            selectedRow: null
        };
        this.handleChangePage = this.handleChangePage.bind(this);
        this.handleChangeRowsPerPage = this.handleChangeRowsPerPage.bind(this);
        this.handleShowTree = this.handleShowTree.bind(this);
        this.handleShowPreview = this.handleShowPreview.bind(this);
        this.handleRowSelection = this.handleRowSelection.bind(this);
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
                showBrowser: !prevState.showBrowser
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
        const {showPreview, selectedRow, showBrowser: showTree} = this.state;
        const {notificationContext, t, classes} = this.props;
        return <CmRouter render={ ({path}) => (
            <Query fetchPolicy={'network-only'} query={allContentQuery}
                   variables={TableQueryVariables(path, this.state.language, this.state)}>
                {({loading, error, data}) => {
                    if (error) {
                        console.log("Error when fetching data: " + error);
                        notificationContext.notify(t('label.contentManager.errors'), ['closeButton', 'noAutomaticClose']);
                    }
                    let rows = [];
                    let totalCount = 0;
                    if (data.jcr && data.jcr.nodesByCriteria) {
                        totalCount = data.jcr.nodesByCriteria.pageInfo.totalCount;
                        rows = _.map(data.jcr.nodesByCriteria.nodes, contentNode => {
                            return {
                                uuid: contentNode.uuid,
                                name: contentNode.displayName,
                                type: contentNode.primaryNodeType.name,
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
                                isSelected: selectedRow ? selectedRow.path === contentNode.path : false
                            }
                        })
                    }
                    const computedTableSize = GRID_SIZE - (showTree ? TREE_SIZE : 0) - (showPreview ? PREVIEW_SIZE : 0);
                    return this.gridRendering(loading, path, computedTableSize, totalCount, rows);
                }}
            </Query>
        )}></CmRouter>
    }

    gridRendering(loading, path, computedTableSize, totalCount, rows) {
        const {showPreview, selectedRow, showBrowser: showTree} = this.state;
        const {t, classes} = this.props;

        return <div>
            {loading && <ProgressOverlay/>}
            <div className={classes.root}>
                <Grid item xs={GRID_SIZE}>
                    <ContentBreadcrumbs path={path}/>
                    <Button
                        onClick={this.handleShowTree}>{t('label.contentManager.tree.' + (showTree ? "hide" : "show"))}</Button>
                    <Button
                        onClick={this.handleShowPreview}>{t('label.contentManager.preview.' + (showPreview ? "hide" : "show"))}</Button>
                </Grid>
                <Grid container spacing={0}>
                    {showTree &&
                    <Grid item xs={TREE_SIZE}><ContentBrowser path={ path }/></Grid>}
                    <Grid item xs={computedTableSize}>
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
                    </Grid>
                    {showPreview && <Grid className={classes.gridColumn} item xs={PREVIEW_SIZE}>
                        <ContentPreview
                            selection={selectedRow}
                            layoutQueryParams={TableQueryVariables(path, this.state.language, this.state)}
                            rowSelectionFunc={ this.handleRowSelection }/>
                    </Grid>}
                </Grid>
            </div>
        </div>
    }
}

ContentLayout = _.flowRight(
    withNotifications(),
    translate(),
    withStyles(styles)
)(ContentLayout);

export {ContentLayout};