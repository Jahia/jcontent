import React, {useEffect} from 'react';
import PropTypes from 'prop-types';
import {useApolloClient, useQuery} from 'react-apollo';
import {
    ContentQueryHandler,
    FilesQueryHandler,
    mixinTypes,
    SearchQueryHandler,
    Sql2SearchQueryHandler
} from './ContentLayout.gql-queries';
import * as _ from 'lodash';
import {ProgressOverlay} from '@jahia/react-material';
import {
    registerContentModificationEventHandler,
    unregisterContentModificationEventHandler
} from '../../eventHandlerRegistry';
import {useTranslation} from 'react-i18next';
import {connect} from 'react-redux';
import {cmClosePaths, cmGoto, cmOpenPaths} from '../../JContent.redux';
import JContentConstants from '../../JContent.constants';
import {getNewNodePath, isDescendantOrSelf} from '../../JContent.utils';
import {cmRemoveSelection, cmSwitchSelection} from './contentSelection.redux';
import {cmSetPreviewSelection} from '../../preview.redux';
import ContentLayout from './ContentLayout';
import {refetchTypes, setRefetcher, unsetRefetcher} from '../../JContent.refetches';
import {structureData, adaptedRow} from '../ContentLayout/ContentLayout.utils';
import usePreloadedData from './usePreloadedData';

const contentQueryHandlerByMode = mode => {
    switch (mode) {
        case JContentConstants.mode.MEDIA:
            return new FilesQueryHandler();
        case JContentConstants.mode.SEARCH:
            return new SearchQueryHandler();
        case JContentConstants.mode.SQL2SEARCH:
            return new Sql2SearchQueryHandler();
        default:
            return new ContentQueryHandler();
    }
};

let currentResult;

export const ContentLayoutContainer = ({
    mode,
    path,
    uilang,
    lang,
    siteKey,
    params,
    pagination,
    sort,
    openedPaths,
    openPaths,
    closePaths,
    selection,
    removeSelection,
    switchSelection,
    setPreviewSelection,
    setPath,
    filesMode,
    previewState,
    previewSelection,
    tableView
}) => {
    const {t} = useTranslation();
    const client = useApolloClient();
    const fetchPolicy = sort.orderBy === 'displayName' ? 'network-only' : 'cache-first';
    const isStructuredView = tableView.viewMode === JContentConstants.tableView.viewMode.STRUCTURED;
    const queryHandler = contentQueryHandlerByMode(mode);
    const layoutQuery = queryHandler.getQuery();
    const rootPath = `/sites/${siteKey}`;
    const preloadForType = tableView.viewType === JContentConstants.tableView.viewType.PAGES ? JContentConstants.tableView.viewType.CONTENT : JContentConstants.tableView.viewType.PAGES;
    let layoutQueryParams = queryHandler.getQueryParams(path, uilang, lang, params, rootPath, pagination, sort, tableView.viewType);

    // Update params for structured view to use different type and recursion filters
    if (isStructuredView) {
        layoutQueryParams = queryHandler.updateQueryParamsForStructuredView(layoutQueryParams, tableView.viewType, mode);
    }

    const {data, error, loading, refetch} = useQuery(layoutQuery, {
        variables: layoutQueryParams,
        fetchPolicy: fetchPolicy
    });

    const onGwtContentModification = async (nodeUuid, nodePath, nodeName, operation) => {
        let refetchObservableQueries = true;

        if (operation === 'update' && !nodePath.endsWith('/' + nodeName)) {
            operation = 'rename';
        }

        if (operation === 'create') {
            let parentPath = nodePath.substring(0, nodePath.lastIndexOf('/'));
            client.cache.flushNodeEntryByPath(parentPath);
            if (path !== parentPath) {
                // Make sure the created CONTENT is visible in the main panel.
                setPath(parentPath);
            }
        } else if (operation === 'delete') {
            // Clear cache entries for subnodes
            Object.keys(client.cache.idByPath)
                .filter(p => isDescendantOrSelf(p, nodePath))
                .forEach(p => client.cache.flushNodeEntryByPath(p));

            // Switch to the closest available ancestor node in case of currently selected node or any of its ancestor nodes deletion.
            if (isDescendantOrSelf(path, nodePath)) {
                setPath(nodePath.substring(0, nodePath.lastIndexOf('/')));
            }

            // Close any expanded nodes that have been just removed.
            let pathsToClose = _.filter(openedPaths, openedPath => isDescendantOrSelf(openedPath, nodePath));
            if (!_.isEmpty(pathsToClose)) {
                closePaths(pathsToClose);
            }

            // De-select any removed nodes.
            if (previewSelection && isDescendantOrSelf(previewSelection, nodePath)) {
                setPreviewSelection(null);
            }
        } else if (operation === 'rename') {
            let parentPath = nodePath.substring(0, nodePath.lastIndexOf('/'));
            let newPath = parentPath + '/' + nodeName;

            // Clear cache entries for subnodes
            Object.keys(client.cache.idByPath)
                .filter(p => isDescendantOrSelf(p, nodePath))
                .forEach(p => client.cache.flushNodeEntryByPath(p));

            // Switch to the new renamed node
            if (isDescendantOrSelf(path, nodePath)) {
                setPath(getNewNodePath(path, nodePath, newPath));
            }

            let pathsToReopen = _.filter(openedPaths, openedPath => isDescendantOrSelf(openedPath, nodePath));
            if (!_.isEmpty(pathsToReopen)) {
                closePaths(pathsToReopen);
                pathsToReopen = _.map(pathsToReopen, pathToReopen => getNewNodePath(pathToReopen, nodePath, newPath));
                openPaths(pathsToReopen);
            }

            // De-select any removed nodes.
            if (previewSelection && isDescendantOrSelf(previewSelection, nodePath)) {
                setPreviewSelection(getNewNodePath(previewSelection, nodePath, newPath));
            }
        } else if (operation === 'update') {
            // If we're modifying the contribute settings we need to flush also node descendants
            // so we fetch the node in cache and we search for contribute mixin
            let node;
            try {
                node = client.readQuery({query: mixinTypes, variables: {path: nodePath}});
            } catch (e) {
                console.log(e);
            }

            client.cache.flushNodeEntryById(nodeUuid);
            await client.reFetchObservableQueries();
            refetchObservableQueries = false;
            let nodeAfterCacheFlush = client.readQuery({query: mixinTypes, variables: {path: nodePath}});
            if (node && nodeAfterCacheFlush && (!_.isEmpty(nodeAfterCacheFlush.jcr.nodeByPath.mixinTypes.filter(mixin => mixin.name === 'jmix:contributeMode')) ||
                !_.isEmpty(node.jcr.nodeByPath.mixinTypes.filter(mixin => mixin.name === 'jmix:contributeMode')))) {
                Object.keys(client.cache.idByPath)
                    .filter(p => isDescendantOrSelf(p, nodePath))
                    .forEach(p => client.cache.flushNodeEntryByPath(p));
            }

            if (selection.length > 0) {
                // Modification when using multiple selection actions
                let selectedNodes = _.clone(selection);
                setTimeout(function () {
                    if (_.includes(selectedNodes, nodePath)) {
                        removeSelection(nodePath);
                        switchSelection(nodePath);
                    }
                });
            }
        }

        if (refetchObservableQueries) {
            client.reFetchObservableQueries();
        }
    };

    // Preload data either for pages or contents depending on current view type
    const preloadedData = usePreloadedData(
        client,
        {
            query: layoutQuery,
            variables: isStructuredView ?
                queryHandler.updateQueryParamsForStructuredView(layoutQueryParams, preloadForType, mode) :
                queryHandler.getQueryParams(path, uilang, lang, params, rootPath, {...pagination, currentPage: 0}, sort, preloadForType),
            fetchPolicy: fetchPolicy
        },
        tableView,
        path,
        pagination);

    useEffect(() => {
        if (data && data.jcr && data.jcr.nodeByPath) {
            // When new results have been loaded, use them for rendering.
            let nodeTypeName = data.jcr.nodeByPath.primaryNodeType.name;
            let subTypes = ['jnt:page', 'jnt:contentFolder', 'jnt:virtualsite'];
            let isSub = !subTypes.includes(nodeTypeName);
            // Sub is not the same as params.sub; refresh and sync up path param state
            if (isSub !== (params.sub === true)) { // Params.sub needs to be boolean type; else falsy
                setPath(path, {sub: isSub});
            }
        }

        setRefetcher(refetchTypes.CONTENT_DATA, {
            query: layoutQuery,
            queryParams: layoutQueryParams,
            refetch: refetch
        });

        registerContentModificationEventHandler(onGwtContentModification);

        return () => {
            unsetRefetcher(refetchTypes.CONTENT_DATA);
            unregisterContentModificationEventHandler(onGwtContentModification);
        };
    });

    if (error || (!loading && !queryHandler.getResultsPath(data))) {
        if (error) {
            const message = t('jcontent:label.contentManager.error.queryingContent', {details: error.message || ''});
            console.error(message);
        }

        return (
            <ContentLayout contentNotFound
                           mode={mode}
                           path={path}
                           filesMode={filesMode}
                           previewState={previewState}
                           previewSelection={previewSelection}
                           rows={[]}
                           loading={loading}
                           totalCount={0}
            />
        );
    }

    if (loading) {
        // While loading new results, render current ones loaded during previous render invocation (if any).
    } else {
        currentResult = queryHandler.getResultsPath(data);
    }

    let rows = [];
    let totalCount = 0;

    if (currentResult) {
        totalCount = currentResult.pageInfo.totalCount;
        if (isStructuredView) {
            rows = structureData(path, currentResult.nodes);
        } else {
            rows = currentResult.nodes.map(r => adaptedRow(r));
        }
    }

    return (
        <React.Fragment>
            {loading &&
            <ProgressOverlay/>}
            <ContentLayout mode={mode}
                           path={path}
                           filesMode={filesMode}
                           previewState={previewState}
                           previewSelection={previewSelection}
                           rows={rows}
                           loading={loading}
                           totalCount={totalCount}
                           dataCounts={{
                               pages: preloadForType === JContentConstants.tableView.viewType.PAGES ? preloadedData.totalCount : totalCount,
                               contents: preloadForType === JContentConstants.tableView.viewType.CONTENT ? preloadedData.totalCount : totalCount
                           }}
            />
        </React.Fragment>
    );
};

const mapStateToProps = state => ({
    mode: state.jcontent.mode,
    siteKey: state.site,
    path: state.jcontent.path,
    lang: state.language,
    previewSelection: state.jcontent.previewSelection,
    previewState: state.jcontent.previewState,
    uilang: state.uilang,
    params: state.jcontent.params,
    filesMode: state.jcontent.filesGrid.mode,
    pagination: state.jcontent.pagination,
    sort: state.jcontent.sort,
    openedPaths: state.jcontent.openPaths,
    selection: state.jcontent.selection,
    tableView: state.jcontent.tableView
});

const mapDispatchToProps = dispatch => ({
    setPath: (path, params) => dispatch(cmGoto({path, params})),
    setPreviewSelection: previewSelection => dispatch(cmSetPreviewSelection(previewSelection)),
    openPaths: paths => dispatch(cmOpenPaths(paths)),
    closePaths: paths => dispatch(cmClosePaths(paths)),
    removeSelection: path => dispatch(cmRemoveSelection(path)),
    switchSelection: path => dispatch(cmSwitchSelection(path))
});

ContentLayoutContainer.propTypes = {
    closePaths: PropTypes.func.isRequired,
    lang: PropTypes.string.isRequired,
    mode: PropTypes.string.isRequired,
    openPaths: PropTypes.func.isRequired,
    openedPaths: PropTypes.array.isRequired,
    pagination: PropTypes.object.isRequired,
    params: PropTypes.object.isRequired,
    path: PropTypes.string.isRequired,
    previewSelection: PropTypes.string,
    setPath: PropTypes.func.isRequired,
    setPreviewSelection: PropTypes.func.isRequired,
    siteKey: PropTypes.string.isRequired,
    sort: PropTypes.object.isRequired,
    uilang: PropTypes.string.isRequired,
    previewState: PropTypes.number.isRequired,
    filesMode: PropTypes.string.isRequired,
    selection: PropTypes.array.isRequired,
    removeSelection: PropTypes.func.isRequired,
    switchSelection: PropTypes.func.isRequired,
    tableView: PropTypes.object.isRequired
};

export default connect(mapStateToProps, mapDispatchToProps)(ContentLayoutContainer);
