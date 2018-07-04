import React from 'react';
import {Query} from 'react-apollo';
import {allContentQuery, TableQueryVariables} from "./gqlQueries";
import * as _ from "lodash";
import ContentListTable from "./list/ContentListTable";
import ContentPreview from "./ContentPreview";
import {Grid, Button, withStyles} from "@material-ui/core";
import ContentBrowser from "./ContentBrowser";
import {compose} from "react-apollo/index";
import {translate} from "react-i18next";
import ContentBreadcrumbs from "./ContentBreadcrumbs";
import CmRouter from './CmRouter'

const styles = theme => ({
    root: {
        flexGrow: 1,
    },
});

class ContentLayout extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            language: "en",
            page: 0,
            rowsPerPage: 25,
            showBrowser: false,
            showPreview: false
        };
        this.handleChangePage = this.handleChangePage.bind(this);
        this.handleChangeRowsPerPage = this.handleChangeRowsPerPage.bind(this);
        this.handleShowTree = this.handleShowTree.bind(this);
        this.handleShowPreview = this.handleShowPreview.bind(this);

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
        this.setState((prevState, props) => {
            return {
                showPreview: !prevState.showPreview
            }
        })
    };

    render() {
        const { showPreview, showBrowser: showTree } = this.state;
        return (<CmRouter render={router => (<Query fetchPolicy={'network-only'} query={allContentQuery} variables={TableQueryVariables(router.path, this.state.language, this.state)}>
            { ({loading, error, data}) => {
                const path = router.path;
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
                            wipLangs: (contentNode.wipLangs != null ? contentNode.wipLangs.values : [])
                        }
                    })
                }
                const xs = 12 - (showTree ? 3 : 0) - (showPreview ? 3 : 0);
                return (
                    <div className={this.props.classes.root}>
                        <Grid item xs={12}>
                            <ContentBreadcrumbs path={path}/>
                            <Button onClick={this.handleShowTree}>{showTree ? "Hide" : "Show"} Tree</Button>
                            <Button onClick={this.handleShowPreview}>{showPreview ? "Hide" : "Show"} Preview</Button>
                        </Grid>
                        <Grid container spacing={0}>
                            {showTree && <Grid item xs={3}><ContentBrowser path={path}/></Grid>}
                            <Grid item xs={xs}>
                                <ContentListTable
                                    totalCount={totalCount}
                                    rows={rows}
                                    pageSize={this.state.rowsPerPage}
                                    onChangeRowsPerPage={this.handleChangeRowsPerPage}
                                    onChangePage={this.handleChangePage}
                                    page={this.state.page}
                                    lang={this.state.language}
                                />
                            </Grid>
                            {showPreview && <Grid item xs={3}><ContentPreview/></Grid>}
                        </Grid>
                    </div>
                )
            }}
        </Query>)}/>);
    }
}

ContentLayout = compose(
    withStyles(styles)
)(ContentLayout);

export {ContentLayout};