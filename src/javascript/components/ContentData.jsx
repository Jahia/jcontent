import React from 'react';
import {Query, withApollo} from 'react-apollo';
import {
    BrowsingQueryHandler,
    SearchQueryHandler,
    Sql2SearchQueryHandler,
    FilesQueryHandler
} from "./gqlQueries";
import * as _ from "lodash";
import {withNotifications, ProgressOverlay} from '@jahia/react-material';
import {registerContentModificationEventHandler, unregisterContentModificationEventHandler} from "./eventHandlerRegistry";
import {translate} from "react-i18next";
import {connect} from "react-redux";
import {cmGoto, cmSetSelection, cmOpenPaths, cmClosePaths} from "./redux/actions";
import Constants from "./constants";
import {extractPaths} from "./utils";

const contentQueryHandlerByMode = mode => {
    switch (mode) {
        case Constants.mode.BROWSE:
            return new BrowsingQueryHandler();
        case Constants.mode.FILES:
            return new FilesQueryHandler();
        case Constants.mode.SEARCH:
            return new SearchQueryHandler();
        case Constants.mode.SQL2SEARCH:
            return new Sql2SearchQueryHandler();
    }
};

class ContentData extends React.Component {

    constructor(props) {

        super(props);

        this.onGwtContentModification = this.onGwtContentModification.bind(this);
    }

    componentDidMount() {
        registerContentModificationEventHandler(this.onGwtContentModification);
    }

    componentWillUnmount() {
        unregisterContentModificationEventHandler(this.onGwtContentModification);
    }

    onGwtContentModification(nodeUuid, nodePath, nodeName, operation, nodeType) {

        let {client, siteKey, path, selection, openedPaths, setPath, setSelection, openPaths, closePaths, mode} = this.props;

        let stateModificationDone = false;

        if (operation == "create") {

            let parentPath = nodePath.substring(0, nodePath.lastIndexOf("/"));
            if (nodeType === "jnt:folder" || nodeType === "jnt:contentFolder") {
                // Make sure the created folder is visible in the tree.
                if (!_.includes(openedPaths, parentPath)) {
                    openPaths(extractPaths(siteKey, parentPath, mode));
                    stateModificationDone = true;
                }
            } else {
                // Make sure the created content is visible in the main panel.
                if (path != parentPath) {
                    setPath(parentPath);
                    stateModificationDone = true;
                }
            }

        } else if (operation == "delete") {

            // Switch to ancestor node in case of currently selected node deletion.
            if (path.startsWith(nodePath)) {
                setPath(nodePath.substring(0, nodePath.lastIndexOf("/")));
                stateModificationDone = true;
            }

            // Close any expanded nodes that have been just removed.
            let pathsToClose = _.filter(openedPaths, openPath => openPath.startsWith(nodePath));
            if (!_.isEmpty(pathsToClose)) {
                closePaths(pathsToClose);
                stateModificationDone = true;
            }

            // De-select any removed nodes.
            if (_.find(selection, node => node.path == nodePath)) {
                let newSelection = _.clone(selection);
                _.remove(newSelection, node => node.path == nodePath);
                setSelection(newSelection);
                stateModificationDone = true;
            }

        } else if (operation === "update") {

            if (nodePath === path) {
                // This is an update of the element currently selected in the tree.

                let name = nodePath.substring(nodePath.lastIndexOf("/") + 1, nodePath.length);
                if (name !== nodeName) {
                    // This a node name change and not any other kind of update: change current CM path to reflect the changed path of the node.
                    let parentPath = nodePath.substring(0, nodePath.lastIndexOf("/"));
                    let newPath = parentPath + "/" + nodeName;
                    setPath(newPath);
                    if (!_.includes(openedPaths, newPath)) {
                        _.remove(openedPaths, openedPath => (openedPath === path || _.includes(openedPath, path.concat("/"))));
                        openPaths(extractPaths(siteKey, newPath, mode));
                    }
                    stateModificationDone = true;
                }
            }

        }

        if (stateModificationDone) {
            // In case of any state modifications, wait a second to let components re-render and perform GrpaphQL requests asynchronously,
            // and avoid store reset done at the same time: Apollo is usually unhappy with this and throws errors.
            setTimeout(function() {
                client.resetStore();
            }, 1000);
        } else {
            client.resetStore();
        }
    }

    render() {
        const {notificationContext, t, mode, children, layoutQuery, layoutQueryParams, setRefetch, orderBy} = this.props;
        return <Query query={layoutQuery} variables={layoutQueryParams} fetchPolicy={orderBy==='displayName'?'network-only':''}>
            {({loading, error, data, refetch}) => {
                let queryHandler = contentQueryHandlerByMode(mode);

                if (setRefetch) {
                    setRefetch({
                        query: layoutQuery,
                        queryParams: layoutQueryParams,
                        refetch: refetch
                    });
                }

                if (error) {
                    let message = t('label.contentManager.error.queryingContent', {details: (error.message ? error.message : '')});
                    console.error(message);
                    //notificationContext.notify(message, ['closeButton', 'noAutomaticClose']);
                    return children({
                                     rows: 0,
                                     totalCount: 0,
                                     layoutQuery: layoutQuery,
                                     layoutQueryParams: layoutQueryParams
                                 });
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
                            nodeName: contentNode.name,
                            primaryNodeType: contentNode.primaryNodeType.name,
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
                            parentDeletionDate: _.map(contentNode.ancestors, ancestor => {return ancestor.deletionDate!==null ? ancestor.deletionDate.value : ''}),
                            parentDeletionUser: _.map(contentNode.ancestors, ancestor => {return ancestor.deletionUser!==null ? ancestor.deletionUser.value : ''}),
                            icon: contentNode.primaryNodeType.icon,
                            width: (contentNode.width != null ? contentNode.width.value : ''),
                            height: (contentNode.width != null ? contentNode.height.value : '')
                        }
                    });
                }

                return <React.Fragment>
                    {loading && <ProgressOverlay/>}
                    {children({
                        rows: rows,
                        totalCount: totalCount,
                        layoutQuery: layoutQuery,
                        layoutQueryParams: layoutQueryParams
                    })}
                </React.Fragment>
            }}
        </Query>
    }
}

const mapStateToProps = (state, ownProps) => ({
    siteKey: state.site,
    path: state.path,
    mode: state.mode,
    selection: state.selection,
    openedPaths: state.openPaths
});

const mapDispatchToProps = (dispatch, ownProps) => ({
    setPath: (path, params) => dispatch(cmGoto({path, params})),
    setSelection: (selection) => dispatch(cmSetSelection(selection)),
    openPaths: (paths) => dispatch(cmOpenPaths(paths)),
    closePaths: (paths) => dispatch(cmClosePaths(paths))
});

ContentData = _.flowRight(
    withNotifications(),
    translate(),
    withApollo,
    connect(mapStateToProps, mapDispatchToProps)
)(ContentData);

export {ContentData, contentQueryHandlerByMode};