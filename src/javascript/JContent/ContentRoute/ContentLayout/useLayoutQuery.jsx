import {useQuery} from '@apollo/client';
import {registry} from '@jahia/ui-extender';
import {replaceFragmentsInDocument, useTreeEntries} from '@jahia/data-helper';
import {QueryHandlersFragments} from '~/JContent/ContentRoute/ContentLayout/queryHandlers';
import {getAccordionItem} from '~/JContent/JContent.utils';

export function useLayoutQuery(options, fragments, queryVariables, accordionItemProps) {
    const defaultOptions = {
        fetchPolicy: 'network-only'
    };

    const tableConfig = getAccordionItem(registry.get('accordionItem', options.mode), accordionItemProps).tableConfig;

    options = {...defaultOptions, ...tableConfig, ...options};

    const queryHandler = options.queryHandler;
    const allFragments = [...(queryHandler.getFragments && queryHandler.getFragments()) || [], ...(fragments || [])];

    queryVariables = {...queryHandler.getQueryVariables(options), ...queryVariables};

    const treeParams = queryHandler.getTreeParams && queryHandler.getTreeParams(options);

    const isStructured = queryHandler.isStructured(options);

    const {treeEntries, error: errorTree, loading: loadingTree, refetch: refetchTree} = useTreeEntries({
        ...treeParams,
        fragments: [...allFragments, QueryHandlersFragments.nodeFields, QueryHandlersFragments.childNodesCount],
        queryVariables,
        openableTypes: treeParams?.openableTypes || queryVariables.typeFilter,
        selectableTypes: treeParams?.selectableTypes || queryVariables.selectableTypesTable || []
    }, {
        errorPolicy: 'all',
        skip: !treeParams
    });

    const layoutQuery = queryHandler.getQuery && replaceFragmentsInDocument(queryHandler.getQuery(), allFragments);

    const {data: flatData, error: errorFlat, loading: loadingFlat, refetch: refetchFlat} = useQuery(layoutQuery, {
        variables: queryVariables,
        fetchPolicy: options.fetchPolicy,
        skip: Boolean(treeParams)
    });

    if (treeParams) {
        const result = queryHandler.structureTreeEntries(treeEntries, treeParams);
        return {isStructured, result, error: errorTree, loading: loadingTree, refetch: refetchTree};
    }

    const queryResult = flatData && queryHandler.getResults(flatData, options);
    const result = isStructured ? queryHandler.structureData(options.path, queryResult) : queryResult;
    return {isStructured, result, error: errorFlat, loading: loadingFlat, refetch: refetchFlat};
}
