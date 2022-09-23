import {useQuery} from 'react-apollo';
import {registry} from '@jahia/ui-extender';
import {replaceFragmentsInDocument, useTreeEntries} from '@jahia/data-helper';
import {QueryHandlersFragments} from '~/JContent/ContentRoute/ContentLayout/queryHandlers';

export function useLayoutQuery(options, fragments, queryVariables) {
    const defaultOptions = {
        fetchPolicy: 'network-only'
    };

    const tableConfig = registry.get('accordionItem', options.mode).tableConfig;

    options = {...defaultOptions, ...tableConfig, ...options};

    const queryHandler = options.queryHandler;
    const allFragments = [...(queryHandler.getFragments && queryHandler.getFragments()) || [], ...(fragments || [])];

    queryVariables = {...queryHandler.getQueryVariables(options), ...queryVariables};

    const treeParams = queryHandler.getTreeParams && queryHandler.getTreeParams(options);

    const isStructured = queryHandler.isStructured(options);

    if (treeParams) {
        // Conditional hook / branch 1 - both branches have the exact same hook structure, useTreeEntries just wraps useQuery
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const {treeEntries, error, loading, refetch} = useTreeEntries({
            ...treeParams,
            fragments: [...allFragments, QueryHandlersFragments.nodeFields, QueryHandlersFragments.childNodesCount],
            queryVariables,
            openableTypes: treeParams.openableTypes || queryVariables.typeFilter,
            selectableTypes: treeParams.selectableTypes || queryVariables.selectableTypesTable || []
        }, {errorPolicy: 'all'});

        const result = queryHandler.structureTreeEntries(treeEntries, treeParams);
        return {isStructured, result, error, loading, refetch};
    }

    const layoutQuery = queryHandler.getQuery && replaceFragmentsInDocument(queryHandler.getQuery(), allFragments);

    // Conditional hook / branch 2 - both branches have the exact same hook structure, useTreeEntries just wraps useQuery
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const {data, error, loading, refetch} = useQuery(layoutQuery, {
        variables: queryVariables,
        fetchPolicy: options.fetchPolicy
    });

    const queryResult = data && queryHandler.getResults(data, options);
    const result = isStructured ? queryHandler.structureData(options.path, queryResult) : queryResult;
    return {isStructured, result, error, loading, refetch};
}
