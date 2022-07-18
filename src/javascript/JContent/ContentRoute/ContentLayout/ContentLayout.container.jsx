import React, {useEffect, useMemo} from 'react';
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
import {
    registerContentModificationEventHandler,
    unregisterContentModificationEventHandler
} from '../../eventHandlerRegistry';
import {useTranslation} from 'react-i18next';
import {useSelector, useDispatch, shallowEqual} from 'react-redux';
import {cmClosePaths, cmGoto, cmOpenPaths} from '~/JContent/JContent.redux';
import JContentConstants from '~/JContent/JContent.constants';
import {getNewNodePath, isDescendantOrSelf} from '~/JContent/JContent.utils';
import {cmRemoveSelection, cmSwitchSelection} from './contentSelection.redux';
import {cmSetPreviewSelection} from '~/JContent/preview.redux';
import ContentLayout from './ContentLayout';
import {refetchTypes, setRefetcher, unsetRefetcher} from '~/JContent/JContent.refetches';
import {isInSearchMode, structureData} from '../ContentLayout/ContentLayout.utils';
import usePreloadedData from './usePreloadedData';
import {Loader} from '@jahia/moonstone';

let currentResult;

export const ContentLayoutContainer = ({
    selector,
    hasGWTHandlers,
    refetcherKey,
    contentQueryHandlerByMode,
    reduxActions,
    ContentLayout
}) => {
    const {t} = useTranslation();
    const client = useApolloClient();
    const {mode, path, uilang, lang, siteKey, params, pagination, sort, openedPaths, selection,
        tableView, previewState, filesMode, previewSelection} = useSelector(selector, shallowEqual);
    const dispatch = useDispatch();
    const fetchPolicy = 'network-only';
    const isStructuredView = tableView.viewMode === JContentConstants.tableView.viewMode.STRUCTURED;
    const queryHandler = useMemo(() => contentQueryHandlerByMode(mode), [mode, contentQueryHandlerByMode]);
    const layoutQuery = queryHandler.getQuery();
    const rootPath = `/sites/${siteKey}`;
    const preloadForType = tableView.viewType === JContentConstants.tableView.viewType.PAGES ? JContentConstants.tableView.viewType.CONTENT : JContentConstants.tableView.viewType.PAGES;

    const layoutQueryParams = useMemo(
        () => {
            let r = queryHandler.getQueryParams({path, uilang, lang, params, rootPath, pagination, sort, viewType: tableView.viewType});
            // Update params for structured view to use different type and recursion filters
            if (isStructuredView) {
                r = queryHandler.updateQueryParamsForStructuredView(r, tableView.viewType, mode);
            }

            return r;
        },
        [path, uilang, lang, params, rootPath, pagination, sort, tableView.viewType, mode, isStructuredView, queryHandler]
    );

    const {data, error, loading, refetch} = useQuery(layoutQuery, {
        variables: layoutQueryParams,
        fetchPolicy: fetchPolicy
    });

    function onGwtCreate(nodePath) {
        let parentPath = nodePath.substring(0, nodePath.lastIndexOf('/'));
        client.cache.flushNodeEntryByPath(parentPath);
        if (path !== parentPath) {
            // Make sure the created CONTENT is visible in the main panel.
            dispatch(reduxActions.setPathAction(parentPath));
        }

        return client.reFetchObservableQueries();
    }

    function onGwtDelete(nodePath) {
        // Clear cache entries for subnodes
        Object.keys(client.cache.idByPath)
            .filter(p => isDescendantOrSelf(p, nodePath))
            .forEach(p => client.cache.flushNodeEntryByPath(p));

        // Switch to the closest available ancestor node in case of currently selected node or any of its ancestor nodes deletion.
        if (isDescendantOrSelf(path, nodePath)) {
            dispatch(reduxActions.setPathAction(nodePath.substring(0, nodePath.lastIndexOf('/'))));
        }

        // Close any expanded nodes that have been just removed.
        let pathsToClose = _.filter(openedPaths, openedPath => isDescendantOrSelf(openedPath, nodePath));
        if (!_.isEmpty(pathsToClose)) {
            dispatch(reduxActions.closePathsAction(pathsToClose));
        }

        // De-select any removed nodes.
        if (previewSelection && isDescendantOrSelf(previewSelection, nodePath)) {
            dispatch(reduxActions.setPreviewSelectionAction(null));
        }

        return client.reFetchObservableQueries();
    }

    function onGwtRename(nodePath, nodeName) {
        let parentPath = nodePath.substring(0, nodePath.lastIndexOf('/'));
        let newPath = parentPath + '/' + nodeName;

        // Clear cache entries for subnodes
        Object.keys(client.cache.idByPath)
            .filter(p => isDescendantOrSelf(p, nodePath))
            .forEach(p => client.cache.flushNodeEntryByPath(p));

        // Switch to the new renamed node
        if (isDescendantOrSelf(path, nodePath)) {
            dispatch(reduxActions.setPathAction(getNewNodePath(path, nodePath, newPath)));
        }

        let pathsToReopen = _.filter(openedPaths, openedPath => isDescendantOrSelf(openedPath, nodePath));
        if (!_.isEmpty(pathsToReopen)) {
            dispatch(reduxActions.closePathsAction(pathsToReopen));
            pathsToReopen = _.map(pathsToReopen, pathToReopen => getNewNodePath(pathToReopen, nodePath, newPath));
            dispatch(reduxActions.openPathsAction(pathsToReopen));
        }

        // De-select any removed nodes.
        if (previewSelection && isDescendantOrSelf(previewSelection, nodePath)) {
            dispatch(reduxActions.setPreviewSelectionAction(getNewNodePath(previewSelection, nodePath, newPath)));
        }

        return client.reFetchObservableQueries();
    }

    async function onGwtUpdate(nodePath, nodeUuid) {
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
                    dispatch(reduxActions.removeSelectionAction(nodePath));
                    dispatch(reduxActions.switchSelectionAction(nodePath));
                }
            });
        }
    }

    const onGwtContentModification = async (nodeUuid, nodePath, nodeName, operation) => {
        if (operation === 'update' && !nodePath.endsWith('/' + nodeName)) {
            operation = 'rename';
        }

        if (operation === 'create') {
            await onGwtCreate(nodePath);
        } else if (operation === 'delete') {
            await onGwtDelete(nodePath);
        } else if (operation === 'rename') {
            await onGwtRename(nodePath, nodeName);
        } else if (operation === 'update') {
            await onGwtUpdate(nodePath, nodeUuid);
        }
    };

    const options = useMemo(() => ({
        query: layoutQuery,
        variables: isStructuredView ?
            queryHandler.updateQueryParamsForStructuredView(layoutQueryParams, preloadForType, mode) :
            queryHandler.getQueryParams({path, uilang, lang, params, rootPath, pagination: {...pagination, currentPage: 0}, sort, viewType: preloadForType}),
        fetchPolicy: fetchPolicy
    }), [isStructuredView, lang, layoutQuery, layoutQueryParams, mode, pagination, params, path, preloadForType, queryHandler, rootPath, sort, uilang]);

    // Preload data either for pages or contents depending on current view type
    const preloadedData = usePreloadedData({
        client,
        options,
        tableView,
        path,
        pagination
    });

    useEffect(() => {
        if (data && data.jcr && data.jcr.nodeByPath) {
            // When new results have been loaded, use them for rendering.
            let nodeTypeName = data.jcr.nodeByPath.primaryNodeType.name;
            let subTypes = ['jnt:page', 'jnt:contentFolder', 'jnt:virtualsite'];
            let isSub = !subTypes.includes(nodeTypeName);
            // Sub is not the same as params.sub; refresh and sync up path param state
            if (isSub !== (params.sub === true) && !params.typeFilter) { // Params.sub needs to be boolean type; else falsy
                // Todo figure out why this is necessary and why it leads to infinite loop
                // Dispatch(reduxActions.setPathAction(path, {sub: isSub}));
            }
        }

        setRefetcher(refetcherKey, {
            query: layoutQuery,
            queryParams: layoutQueryParams,
            refetch: refetch
        });

        if (hasGWTHandlers) {
            registerContentModificationEventHandler(onGwtContentModification);
        }

        return () => {
            unsetRefetcher(refetcherKey);
            if (hasGWTHandlers) {
                unregisterContentModificationEventHandler(onGwtContentModification);
            }
        };
    });

    if (error || (!loading && !queryHandler.getResultsPath(data))) {
        if (error) {
            const message = t('jcontent:label.contentManager.error.queryingContent', {details: error.message || ''});
            console.error(message);
        }

        return (
            <ContentLayout isContentNotFound
                           mode={mode}
                           path={path}
                           filesMode={filesMode}
                           previewState={previewState}
                           previewSelection={previewSelection}
                           rows={[]}
                           isLoading={loading}
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
        if (isStructuredView && !isInSearchMode(mode)) {
            rows = structureData(path, currentResult.nodes);
        } else {
            rows = currentResult.nodes;
        }
    }

    return (
        <React.Fragment>
            {loading && (
                <div className="flexFluid flexCol_center alignCenter" style={{flex: '9999', backgroundColor: 'var(--color-light)'}}>
                    <Loader size="big"/>
                </div>
            )}
            <ContentLayout mode={mode}
                           path={path}
                           filesMode={filesMode}
                           previewState={previewState}
                           previewSelection={previewSelection}
                           rows={rows}
                           isLoading={loading}
                           totalCount={totalCount}
                           dataCounts={{
                               pages: preloadForType === JContentConstants.tableView.viewType.PAGES ? preloadedData.totalCount : totalCount,
                               contents: preloadForType === JContentConstants.tableView.viewType.CONTENT ? preloadedData.totalCount : totalCount
                           }}
            />
        </React.Fragment>
    );
};

const selector = state => ({
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

const contentQueryHandlerByMode = mode => {
    console.log(mode);
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

ContentLayoutContainer.propTypes = {
    hasGWTHandlers: PropTypes.bool,
    selector: PropTypes.func,
    refetcherKey: PropTypes.string,
    contentQueryHandlerByMode: PropTypes.func,
    reduxActions: {
        setPathAction: PropTypes.func.isRequired,
        setPreviewSelectionAction: PropTypes.func.isRequired,
        openPathsAction: PropTypes.func.isRequired,
        closePathsAction: PropTypes.func.isRequired,
        removeSelectionAction: PropTypes.func.isRequired,
        switchSelectionAction: PropTypes.func.isRequired
    },
    ContentLayout: PropTypes.element
};

ContentLayoutContainer.defaultProps = {
    hasGWTHandlers: true,
    selector: selector,
    refetcherKey: refetchTypes.CONTENT_DATA,
    contentQueryHandlerByMode: contentQueryHandlerByMode,
    reduxActions: {
        setPathAction: (path, params) => cmGoto({path, params}),
        setPreviewSelectionAction: previewSelection => cmSetPreviewSelection(previewSelection),
        openPathsAction: paths => cmOpenPaths(paths),
        closePathsAction: paths => cmClosePaths(paths),
        removeSelectionAction: path => cmRemoveSelection(path),
        switchSelectionAction: path => cmSwitchSelection(path)
    },
    ContentLayout: ContentLayout
};

export default ContentLayoutContainer;
