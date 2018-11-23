import React from 'react';
import {Query, withApollo} from 'react-apollo';
import {
    BrowsingQueryHandler,
    SearchQueryHandler,
    Sql2SearchQueryHandler,
    FilesQueryHandler
} from './gqlQueries';
import * as _ from 'lodash';
import {withNotifications, ProgressOverlay} from '@jahia/react-material';
import {registerContentModificationEventHandler, unregisterContentModificationEventHandler} from './eventHandlerRegistry';
import {translate} from 'react-i18next';
import {connect} from 'react-redux';
import {cmGoto, cmSetSelection, cmOpenPaths, cmClosePaths} from './redux/actions';
import Constants from './constants';
import {extractPaths, isDescendantOrSelf} from './utils';
import {setModificationHook} from './copyPaste/contentModificationHook';
import {compose} from 'react-apollo';

const contentQueryHandlerByMode = mode => {
    switch (mode) {
        case Constants.mode.FILES:
            return new FilesQueryHandler();
        case Constants.mode.SEARCH:
            return new SearchQueryHandler();
        case Constants.mode.SQL2SEARCH:
            return new Sql2SearchQueryHandler();
        default:
            return new BrowsingQueryHandler();
    }
};

class ContentDataView extends React.Component {
    constructor(props) {
        super(props);

        this.onGwtContentModification = this.onGwtContentModification.bind(this);
    }

    componentDidMount() {
        registerContentModificationEventHandler(this.onGwtContentModification);
        setModificationHook(args => this.onGwtContentModification(...args));
    }

    componentWillUnmount() {
        unregisterContentModificationEventHandler(this.onGwtContentModification);
    }

    onGwtContentModification(nodeUuid, nodePath, nodeName, operation, nodeType) {
        let {client, siteKey, path, selection, openedPaths, setPath, setSelection, openPaths, closePaths, mode} = this.props;

        let stateModificationDone = false;

        if (operation === 'create') {
            let parentPath = nodePath.substring(0, nodePath.lastIndexOf('/'));
            if (nodeType === 'jnt:folder' || nodeType === 'jnt:contentFolder') {
                // Make sure the created folder is visible in the tree.
                if (!_.includes(openedPaths, parentPath)) {
                    openPaths(extractPaths(siteKey, parentPath, mode));
                    stateModificationDone = true;
                }
            } else if (path !== parentPath) {
                // Make sure the created content is visible in the main panel.
                setPath(parentPath);
                stateModificationDone = true;
            }
        } else if (operation === 'delete') {
            // Switch to the closest available ancestor node in case of currently selected node or any of its ancestor nodes deletion.
            if (isDescendantOrSelf(path, nodePath)) {
                setPath(nodePath.substring(0, nodePath.lastIndexOf('/')));
                stateModificationDone = true;
            }

            // Close any expanded nodes that have been just removed.
            let pathsToClose = _.filter(openedPaths, openedPath => isDescendantOrSelf(openedPath, nodePath));
            if (!_.isEmpty(pathsToClose)) {
                closePaths(pathsToClose);
                stateModificationDone = true;
            }

            // De-select any removed nodes.
            if (_.find(selection, node => node.path === nodePath)) {
                let newSelection = _.clone(selection);
                _.remove(newSelection, node => node.path === nodePath);
                setSelection(newSelection);
                stateModificationDone = true;
            }
        } else if (operation === 'update') {
            if (isDescendantOrSelf(path, nodePath)) {
                // This is an update of either the element currently selected in the tree or one of its ancestors.

                let name = nodePath.substring(nodePath.lastIndexOf('/') + 1, nodePath.length);
                if (nodeName && name !== nodeName) {
                    // This is a node name change: update current CM path to reflect the changed path of the node.

                    let ancestorPath = nodePath;
                    let ancestorParentPath = ancestorPath.substring(0, ancestorPath.lastIndexOf('/'));
                    let newAncestorPath = ancestorParentPath + '/' + nodeName;
                    setPath(ContentDataView.getNewNodePath(path, ancestorPath, newAncestorPath));

                    let pathsToReopen = _.filter(openedPaths, openedPath => isDescendantOrSelf(openedPath, ancestorPath));
                    if (!_.isEmpty(pathsToReopen)) {
                        closePaths(pathsToReopen);
                        pathsToReopen = _.map(pathsToReopen, pathToReopen => ContentDataView.getNewNodePath(pathToReopen, ancestorPath, newAncestorPath));
                        openPaths(pathsToReopen);
                    }

                    stateModificationDone = true;
                }
            }
        }

        if (stateModificationDone) {
            // In case of any state modifications, wait a second to let components re-render and perform GrpaphQL requests asynchronously,
            // and avoid store reset done at the same time: Apollo is usually unhappy with this and throws errors.
            setTimeout(function () {
                client.resetStore();
            }, 1000);
        } else {
            client.resetStore();
        }
    }

    static getNewNodePath(oldPath, oldAncestorPath, newAncestorPath) {
        let relativePath = oldPath.substring(oldAncestorPath.length, oldPath.length);
        return (newAncestorPath + relativePath);
    }

    render() {
        const {notificationContext, t, mode, children, layoutQuery, layoutQueryParams, setRefetch, orderBy} = this.props;
        return (
            <Query query={layoutQuery} variables={layoutQueryParams} fetchPolicy={orderBy === 'displayName' ? 'network-only' : ''}>
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
                        // NotificationContext.notify(message, ['closeButton', 'noAutomaticClose']);
                        return children({
                            rows: [],
                            totalCount: 0,
                            contentNotFound: true,
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
                                mixinTypes: contentNode.mixinTypes,
                                type: contentNode.primaryNodeType.displayName,
                                created: contentNode.created.value,
                                createdBy: contentNode.createdBy.value,
                                path: contentNode.path,
                                publicationStatus: contentNode.aggregatedPublicationInfo.publicationStatus,
                                isLocked: contentNode.lockOwner !== null,
                                lockOwner: contentNode.lockOwner ? contentNode.lockOwner.value : '',
                                lastPublishedBy: (contentNode.lastPublishedBy ? contentNode.lastPublishedBy.value : ''),
                                lastPublished: (contentNode.lastPublished ? contentNode.lastPublished.value : ''),
                                lastModifiedBy: (contentNode.lastModifiedBy ? contentNode.lastModifiedBy.value : ''),
                                lastModified: (contentNode.lastModified ? contentNode.lastModified.value : ''),
                                deletedBy: (contentNode.deletedBy ? contentNode.deletedBy.value : ''),
                                deleted: (contentNode.deleted ? contentNode.deleted.value : ''),
                                wipStatus: (contentNode.wipStatus ? contentNode.wipStatus.value : ''),
                                wipLangs: (contentNode.wipLangs ? contentNode.wipLangs.values : []),
                                parentDeletionDate: _.map(contentNode.ancestors, ancestor => {
                                    return ancestor.deletionDate ? ancestor.deletionDate.value : '';
                                }),
                                parentDeletionUser: _.map(contentNode.ancestors, ancestor => {
                                    return ancestor.deletionUser ? ancestor.deletionUser.value : '';
                                }),
                                icon: contentNode.primaryNodeType.icon,
                                width: (contentNode.width ? contentNode.width.value : ''),
                                height: (contentNode.width ? contentNode.height.value : '')
                            };
                        });
                    }

                    return (
                        <React.Fragment>
                            {loading && <ProgressOverlay/>}
                            {children({
                                rows: rows,
                                totalCount: totalCount,
                                layoutQuery: layoutQuery,
                                layoutQueryParams: layoutQueryParams
                            })}
                        </React.Fragment>
                    );
                }}
            </Query>
        );
    }
}

const mapStateToProps = state => ({
    siteKey: state.site,
    path: state.path,
    mode: state.mode,
    selection: state.selection,
    openedPaths: state.openPaths
});

const mapDispatchToProps = dispatch => ({
    setPath: (path, params) => dispatch(cmGoto({path, params})),
    setSelection: selection => dispatch(cmSetSelection(selection)),
    openPaths: paths => dispatch(cmOpenPaths(paths)),
    closePaths: paths => dispatch(cmClosePaths(paths))
});

let ContentData = compose(
    withNotifications(),
    translate(),
    withApollo,
    connect(mapStateToProps, mapDispatchToProps)
)(ContentDataView);

export {ContentData, contentQueryHandlerByMode};
