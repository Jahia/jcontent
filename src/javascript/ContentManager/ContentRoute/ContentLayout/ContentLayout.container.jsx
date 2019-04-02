import React from 'react';
import PropTypes from 'prop-types';
import {compose, Query, withApollo} from 'react-apollo';
import {
    ContentQueryHandler,
    FilesQueryHandler,
    SearchQueryHandler,
    Sql2SearchQueryHandler
} from './ContentLayout.gql-queries';
import * as _ from 'lodash';
import {ProgressOverlay, withNotifications} from '@jahia/react-material';
import {
    registerContentModificationEventHandler,
    unregisterContentModificationEventHandler
} from '../../eventHandlerRegistry';
import {translate} from 'react-i18next';
import {connect} from 'react-redux';
import {cmClosePaths, cmGoto, cmOpenPaths, cmRemovePathsToRefetch} from '../../ContentManager.redux-actions';
import ContentManagerConstants from '../../ContentManager.constants';
import {extractPaths, getNewNodePath, isDescendantOrSelf} from '../../ContentManager.utils';
import {setModificationHook} from './ContentLayout.utils';
import {cmSetPreviewSelection} from '../../preview.redux-actions';
import ContentLayout from './ContentLayout';
import {setContentListDataRefetcher} from '../../ContentManager.refetches';

const contentQueryHandlerByMode = mode => {
    switch (mode) {
        case ContentManagerConstants.mode.FILES:
            return new FilesQueryHandler();
        case ContentManagerConstants.mode.SEARCH:
            return new SearchQueryHandler();
        case ContentManagerConstants.mode.SQL2SEARCH:
            return new Sql2SearchQueryHandler();
        default:
            return new ContentQueryHandler();
    }
};

export class ContentLayoutContainer extends React.Component {
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
        let {client, siteKey, path, previewSelection, openedPaths, setPath, setPreviewSelection, openPaths, closePaths, mode} = this.props;

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
            if (previewSelection === nodePath) {
                setPreviewSelection(null);
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
                    setPath(getNewNodePath(path, ancestorPath, newAncestorPath));

                    let pathsToReopen = _.filter(openedPaths, openedPath => isDescendantOrSelf(openedPath, ancestorPath));
                    if (!_.isEmpty(pathsToReopen)) {
                        closePaths(pathsToReopen);
                        pathsToReopen = _.map(pathsToReopen, pathToReopen => getNewNodePath(pathToReopen, ancestorPath, newAncestorPath));
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

    render() {
        const {notificationContext, t, mode, path, uiLang, lang, siteKey, params, pagination, sort, pathsToRefetch, removePathsToRefetch, setPath, treeState, filesMode, previewState, previewSelection} = this.props;
        let fetchPolicy = sort.orderBy === 'displayName' ? 'network-only' : 'cache-first';
        // If the path to display is part of the paths to refetch then refetch
        if (!_.isEmpty(pathsToRefetch) && pathsToRefetch.indexOf(path) !== -1) {
            removePathsToRefetch([path]);
            fetchPolicy = 'network-only';
        }

        let queryHandler = contentQueryHandlerByMode(mode);
        const layoutQuery = queryHandler.getQuery();
        const rootPath = `/sites/${siteKey}`;

        const layoutQueryParams = queryHandler.getQueryParams(path, uiLang, lang, params, rootPath, pagination, sort);

        // Workaround to prevent QA-11390
        // See https://github.com/apollographql/react-apollo/issues/2658
        // FIXME To be removed once the issue has been resolved in react-apollo
        const key = JSON.stringify(layoutQueryParams);

        return (
            <Query key={key} query={layoutQuery} variables={layoutQueryParams} fetchPolicy={fetchPolicy}>
                {({loading, error, data, refetch}) => {
                    let queryHandler = contentQueryHandlerByMode(mode);

                    setContentListDataRefetcher({
                        query: layoutQuery,
                        queryParams: layoutQueryParams,
                        refetch: refetch
                    });

                    if (error) {
                        let message = t('label.contentManager.error.queryingContent', {details: (error.message ? error.message : '')});
                        console.error(message);
                        return (
                            <ContentLayout contentNotFound
                                           mode={mode}
                                           path={path}
                                           filesMode={filesMode}
                                           treeState={treeState}
                                           previewState={previewState}
                                           previewSelection={previewSelection}
                                           rows={[]}
                                           loading={loading}
                                           totalCount={0}
                                           layoutQuery={layoutQuery}
                                           layoutQueryParams={layoutQueryParams}/>
                        );
                    }

                    if (loading) {
                        // While loading new results, render current ones loaded during previous render invocation (if any).
                    } else {
                        if (data.jcr && data.jcr.nodeByPath) {
                            // When new results have been loaded, use them for rendering.
                            let nodeTypeName = data.jcr.nodeByPath.primaryNodeType.name;
                            if (nodeTypeName === 'jnt:page' && params.sub && params.sub === true) {
                                setPath(path, {sub: false});
                            } else if (nodeTypeName !== 'jnt:page' && (!params.sub || params.sub === false)) {
                                setPath(path, {sub: true});
                            }
                        }
                        this.currentResult = queryHandler.getResultsPath(data);
                    }

                    let rows = [];
                    let totalCount = 0;
                    notificationContext.closeNotification();

                    if (this.currentResult) {
                        totalCount = this.currentResult.pageInfo.totalCount;
                        rows = this.currentResult.nodes;
                    }

                    return (
                        <React.Fragment>
                            {loading &&
                            <ProgressOverlay/>
                            }
                            <ContentLayout mode={mode}
                                           path={path}
                                           filesMode={filesMode}
                                           treeState={treeState}
                                           previewState={previewState}
                                           previewSelection={previewSelection}
                                           rows={rows}
                                           loading={loading}
                                           totalCount={totalCount}
                                           layoutQuery={layoutQuery}
                                           layoutQueryParams={layoutQueryParams}/>
                        </React.Fragment>
                    );
                }}
            </Query>
        );
    }
}

const mapStateToProps = state => ({
    mode: state.mode,
    siteKey: state.site,
    path: state.path,
    lang: state.language,
    previewSelection: state.previewSelection,
    previewState: state.previewState,
    uiLang: state.uiLang,
    params: state.params,
    filesMode: state.filesGrid.mode,
    pagination: state.pagination,
    sort: state.sort,
    openedPaths: state.openPaths,
    pathsToRefetch: state.pathsToRefetch,
    treeState: state.treeState
});

const mapDispatchToProps = dispatch => ({
    setPath: (path, params) => dispatch(cmGoto({path, params})),
    setPreviewSelection: previewSelection => dispatch(cmSetPreviewSelection(previewSelection)),
    openPaths: paths => dispatch(cmOpenPaths(paths)),
    closePaths: paths => dispatch(cmClosePaths(paths)),
    removePathsToRefetch: paths => dispatch(cmRemovePathsToRefetch(paths))
});

ContentLayoutContainer.propTypes = {
    client: PropTypes.object.isRequired,
    closePaths: PropTypes.func.isRequired,
    lang: PropTypes.string.isRequired,
    mode: PropTypes.string.isRequired,
    notificationContext: PropTypes.object.isRequired,
    openPaths: PropTypes.func.isRequired,
    openedPaths: PropTypes.array.isRequired,
    pagination: PropTypes.object.isRequired,
    params: PropTypes.object.isRequired,
    path: PropTypes.string.isRequired,
    pathsToRefetch: PropTypes.array.isRequired,
    previewSelection: PropTypes.string,
    removePathsToRefetch: PropTypes.func.isRequired,
    setPath: PropTypes.func.isRequired,
    setPreviewSelection: PropTypes.func.isRequired,
    siteKey: PropTypes.string.isRequired,
    sort: PropTypes.object.isRequired,
    t: PropTypes.func.isRequired,
    uiLang: PropTypes.string.isRequired,
    treeState: PropTypes.number.isRequired,
    previewState: PropTypes.number.isRequired,
    filesMode: PropTypes.string.isRequired
};

export default compose(
    withNotifications(),
    translate(),
    withApollo,
    connect(mapStateToProps, mapDispatchToProps)
)(ContentLayoutContainer);
