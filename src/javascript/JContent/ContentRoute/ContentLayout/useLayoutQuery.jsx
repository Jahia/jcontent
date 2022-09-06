import {shallowEqual, useSelector} from 'react-redux';
import {useQuery} from 'react-apollo';
import {registry} from '@jahia/ui-extender';
import {replaceFragmentsInDocument, useTreeEntries} from '@jahia/data-helper';
import {QueryHandlersFragments} from '~/JContent/ContentRoute/ContentLayout/queryHandlers';

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

    const isStructured = queryHandler.isStructured(selection);

    if (treeParams) {
        // Conditional hook / branch 1 - both branches have the exact same hook structure, useTreeEntries just wraps useQuery
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const {treeEntries, error, loading, refetch} = useTreeEntries({
            ...treeParams,
            fragments: [...allFragments, QueryHandlersFragments.nodeFields, QueryHandlersFragments.childNodesCount],
            queryVariables,
            openableTypes: treeParams.openableTypes || queryVariables.typeFilter,
            selectableTypes: treeParams.selectableTypes || []
        });

        const result = queryHandler.structureTreeEntries(treeEntries);
        return {isStructured, result, error, loading, refetch};
    }

    const layoutQuery = queryHandler.getQuery && replaceFragmentsInDocument(queryHandler.getQuery(), allFragments);

    // Conditional hook / branch 2 - both branches have the exact same hook structure, useTreeEntries just wraps useQuery
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const {data, error, loading, refetch} = useQuery(layoutQuery, {
        variables: queryVariables,
        fetchPolicy
    });

    const queryResult = data && queryHandler.getResults(data, selection);
    const result = isStructured ? queryHandler.structureData(selection.path, queryResult) : queryResult;
    return {isStructured, result, error, loading, refetch};
}
