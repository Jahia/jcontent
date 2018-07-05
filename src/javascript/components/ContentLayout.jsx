import React from 'react';
import {Query} from 'react-apollo';
import {allContentQuery, TableQueryVariables} from "./gqlQueries";
import * as _ from "lodash";
import ContentListTable from "./list/ContentListTable";
import ContentPreview from "./ContentPreview";
import {Grid, Button, withStyles} from "@material-ui/core";
import ContentBrowser from "./ContentBrowser";
import {compose} from "react-apollo/index";
import ContentBreadcrumbs from "./ContentBreadcrumbs";

const styles = theme => ({
    root: {
        flexGrow: 1,
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
            language: "en",
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
        const { showPreview, selectedRow, showBrowser: showTree } = this.state;
        const { classes } = this.props;
        const path = this.props.match.url;
        return <Query fetchPolicy={'network-only'} query={allContentQuery} variables={TableQueryVariables(path, this.state.language, this.state)}>
            { ({loading, error, data}) => {
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
                            isPublished: contentNode.aggregatedPublicationInfo.publicationStatus === 'PUBLISHED',
                            isLocked: contentNode.lockOwner !== null,
                            isMarkedForDeletion: contentNode.aggregatedPublicationInfo.publicationStatus === 'MARKED_FOR_DELETION',
                            neverPublished: contentNode.aggregatedPublicationInfo.publicationStatus === 'NOT_PUBLISHED',
                            isModified: contentNode.aggregatedPublicationInfo.publicationStatus === 'MODIFIED',
                            lastPublishedBy: (contentNode.lastPublishedBy !== null ? contentNode.lastPublishedBy.value : ''),
                            lastPublished: (contentNode.lastPublished !== null ? contentNode.lastPublished.value : ''),
                            modifiedBy: (contentNode.lastModifiedBy !== null ? contentNode.lastModifiedBy.value : ''),
                            lastModified: (contentNode.lastModified !== null ? contentNode.lastModified.value : ''),
                            wipStatus: (contentNode.wipStatus != null ? contentNode.wipStatus.value : ''),
                            wipLangs: (contentNode.wipLangs != null ? contentNode.wipLangs.values : []),
                            isSelected: selectedRow ? selectedRow.path === contentNode.path : false
                        }
                    })
                }
                const computedTableSize = GRID_SIZE - (showTree ? TREE_SIZE : 0) - (showPreview ? PREVIEW_SIZE : 0);
                return (
                    <div className={classes.root}>
                        <Grid item xs={ GRID_SIZE }>
                            <ContentBreadcrumbs path={this.props.match.url}/>
                            <Button onClick={this.handleShowTree}>{showTree ? "Hide" : "Show"} Tree</Button>
                            <Button onClick={this.handleShowPreview}>{showPreview ? "Hide" : "Show"} Preview</Button>
                        </Grid>
                        <Grid container spacing={0}>
                            {showTree && <Grid item xs={ TREE_SIZE }><ContentBrowser match={this.props.match}/></Grid>}
                            <Grid item xs={ computedTableSize }>
                                <ContentListTable
                                    match={this.props.match}
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
                            {showPreview && <Grid className={ classes.gridColumn }item xs={ PREVIEW_SIZE }><ContentPreview selection={ selectedRow } /></Grid>}
                        </Grid>
                    </div>
                )
            }}
        </Query>;
    }
}

ContentLayout = compose(
    withStyles(styles)
)(ContentLayout);

export {ContentLayout};