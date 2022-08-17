import React, {useEffect} from 'react';
import {useApolloClient} from 'react-apollo';
import {mixinTypes} from './ContentLayout.gql-queries';
import * as _ from 'lodash';
import {
    registerContentModificationEventHandler,
    unregisterContentModificationEventHandler
} from '../../eventHandlerRegistry';
import {useTranslation} from 'react-i18next';
import {shallowEqual, useDispatch, useSelector} from 'react-redux';
import {cmClosePaths, cmGoto, cmOpenPaths} from '~/JContent/JContent.redux';
import {getNewNodePath, isDescendantOrSelf} from '~/JContent/JContent.utils';
import {cmRemoveSelection, cmSwitchSelection} from './contentSelection.redux';
import {cmSetPreviewSelection} from '~/JContent/preview.redux';
import ContentLayout from './ContentLayout';
import {refetchTypes, setRefetcher, unsetRefetcher} from '~/JContent/JContent.refetches';
import {Loader} from '@jahia/moonstone';
import {useLayoutQuery} from '~/JContent/ContentRoute/ContentLayout/useLayoutQuery';

let currentResult;

export const ContentLayoutContainer = () => {
    const {t} = useTranslation('jcontent');
    const client = useApolloClient();

    const {mode, path, previewSelection, previewState, filesMode, openedPaths, selection} = useSelector(state => ({
        mode: state.jcontent.mode,
        path: state.jcontent.path,
        previewSelection: state.jcontent.previewSelection,
        previewState: state.jcontent.previewState,
        params: state.jcontent.params,
        filesMode: state.jcontent.filesGrid.mode,
        openedPaths: state.jcontent.openPaths,
        selection: state.jcontent.selection
    }), shallowEqual);

    const dispatch = useDispatch();
    const setPath = (path, params) => dispatch(cmGoto({path, params}));
    const setPreviewSelection = previewSelection => dispatch(cmSetPreviewSelection(previewSelection));
    const openPaths = paths => dispatch(cmOpenPaths(paths));
    const closePaths = paths => dispatch(cmClosePaths(paths));
    const removeSelection = path => dispatch(cmRemoveSelection(path));
    const switchSelection = path => dispatch(cmSwitchSelection(path));

    const {layoutQuery, layoutQueryParams, result, error, loading, refetch} = useLayoutQuery();

    function onGwtCreate(nodePath) {
        let parentPath = nodePath.substring(0, nodePath.lastIndexOf('/'));
        client.cache.flushNodeEntryByPath(parentPath);
        if (path !== parentPath) {
            // Make sure the created CONTENT is visible in the main panel.
            setPath(parentPath);
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
                    removeSelection(nodePath);
                    switchSelection(nodePath);
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

    useEffect(() => {
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

    if (error || (!loading && !result)) {
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
        currentResult = result;
    }

    let rows = [];
    let totalCount = 0;

    if (currentResult) {
        totalCount = currentResult.pageInfo.totalCount;
        rows = currentResult.nodes;
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
            />
        </React.Fragment>
    );
};

export default ContentLayoutContainer;
