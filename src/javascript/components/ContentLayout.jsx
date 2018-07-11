import React from 'react';
import {Query} from 'react-apollo';
import {allContentQuery, TableQueryVariables} from "./gqlQueries";
import * as _ from "lodash";
import ContentListTable from "./list/ContentListTable";
import ContentPreview from "./ContentPreview";
import {Grid, Button, withStyles} from "@material-ui/core";
import ContentTrees from "./ContentTrees";
import {withNotifications, ProgressOverlay} from '@jahia/react-material';
import {translate} from "react-i18next";
import ContentBreadcrumbs from "./ContentBreadcrumbs";
import CmRouter from './CmRouter'
import classNames from "classnames";

const styles = theme => ({
    side: {
        flexGrow: 1,
        flexBasis: "auto",
    },
    main: {
        flexGrow: 99,
        flexBasis: "auto",
    },
    animate: {
        transition: "all 200ms ease-in-out"
    },
    container: {
        flexWrap: "nowrap"
    }
});

class ContentLayout extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            language: this.props.lang,
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
        const { notificationContext, t, uiLang, sitePath, classes } = this.props;
        return (<CmRouter render={({path}) => (<Query fetchPolicy={'network-only'} query={allContentQuery} variables={TableQueryVariables(path, this.state.language, this.state, uiLang)}>
            { ({loading, error, data}) => {
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
                            wipLangs: (contentNode.wipLangs != null ? contentNode.wipLangs.values : [])
                        }
                    })
                }
                return (
                    <div>
                        {loading && <ProgressOverlay/>}
                        <div>
                            <Grid item xs={12}>
                                <ContentBreadcrumbs path={path}/>
                                <Button
                                    onClick={this.handleShowTree}>{t('label.contentManager.tree.' + (showTree ? "hide" : "show"))}</Button>
                                <Button
                                    onClick={this.handleShowPreview}>{t('label.contentManager.preview.' + (showPreview ? "hide" : "show"))}</Button>
                            </Grid>
                            <Grid container spacing={0} className={classes.container}>
                                <Grid item xs classes={{item: classNames(classes.side, showTree && classes.animate)}}>
                                    {
                                        showTree &&
                                        <ContentTrees path={path} rootPath={sitePath} lang={this.state.language}/>
                                    }
                                </Grid>
                                <Grid item xs
                                      classes={{item: classNames(classes.main, (showTree || showPreview) && classes.animate)}}>
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
                                <Grid item xs
                                      classes={{item: classNames(classes.side, showPreview && classes.animate)}}>{showPreview &&
                                <ContentPreview/>}</Grid>
                            </Grid>
                        </div>
                    </div>
                )
            }}
        </Query>)}/>);
    }
}

ContentLayout = _.flowRight(
    withNotifications(),
    translate(),
    withStyles(styles)
)(ContentLayout);

export {ContentLayout};