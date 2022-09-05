import {shallowEqual, useSelector} from 'react-redux';
import {useQuery} from 'react-apollo';
import {registry} from '@jahia/ui-extender';
import {replaceFragmentsInDocument, useTreeEntries} from '@jahia/data-helper';
import {QueryHandlersFragments} from '~/JContent/ContentRoute/ContentLayout/queryHandlers';
import {useRef} from 'react';

const useHookSwitch = (b, useHook1, useHook2) => b ? useHook1 : useHook2;

export function useLayoutQuery(selector, options, fragments, queryVariables) {
    const defaultOptions = {
        fetchPolicy: 'network-only'
    };

    if (!selector) {
        selector = state => ({
            mode: state.jcontent.mode,
            siteKey: state.site,
            path: state.jcontent.path,
            lang: state.language,
            uilang: state.uilang,
            params: state.jcontent.params,
            pagination: state.jcontent.pagination,
            sort: state.jcontent.sort,
            tableView: state.jcontent.tableView,
            openPaths: state.jcontent.tableOpenPaths
        });
    }

    const selection = useSelector(selector, shallowEqual);
    const {fetchPolicy} = {...defaultOptions, ...options};

    const queryHandler = registry.get('accordionItem', selection.mode).queryHandler;
    const allFragments = [...(queryHandler.getFragments && queryHandler.getFragments()) || [], ...(fragments || [])];

    queryVariables = {...queryHandler.getQueryVariables(selection), ...queryVariables};

    const treeParams = queryHandler.getTreeParams && queryHandler.getTreeParams(selection);
    const useTree = useRef(Boolean(treeParams));
    if (useTree.current !== Boolean(treeParams)) {
        throw new Error('Cannot switch hook mode, make sure your component is not being reused by adding a key');
    }

    const isStructured = queryHandler.isStructured(selection);

    const useTreeMode = () => {
        const {treeEntries, error, loading, refetch} = useTreeEntries({
            ...treeParams,
            fragments: [...allFragments, QueryHandlersFragments.nodeFields, QueryHandlersFragments.childNodesCount],
            queryVariables,
            openableTypes: treeParams.openableTypes || queryVariables.typeFilter,
            selectableTypes: treeParams.selectableTypes || []
        });

        const result = queryHandler.structureTreeEntries(treeEntries);
        return {isStructured, result, error, loading, refetch};
    };

    const useQueryMode = () => {
        const layoutQuery = queryHandler.getQuery && replaceFragmentsInDocument(queryHandler.getQuery(), allFragments);

        const {data, error, loading, refetch} = useQuery(layoutQuery, {
            variables: queryVariables,
            fetchPolicy
        });

        const queryResult = data && queryHandler.getResults(data, selection);
        const result = isStructured ? queryHandler.structureData(selection.path, queryResult) : queryResult;
        return {isStructured, result, error, loading, refetch};
    };

    const useContent = useHookSwitch(useTree.current, useTreeMode, useQueryMode);

    return useContent();
}
