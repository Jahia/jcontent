import {useQuery} from '@apollo/client';
import {registry} from '@jahia/ui-extender';
import {replaceFragmentsInDocument, useTreeEntries} from '@jahia/data-helper';
import {QueryHandlersFragments} from '~/JContent/ContentRoute/ContentLayout/queryHandlers';
import {getAccordionItem} from '~/JContent/JContent.utils';
import {Constants} from '~/ContentEditor/SelectorTypes/Picker/Picker.constants';

export function useLayoutQuery(options, fragments, queryVariables, accordionItemProps) {
    const defaultOptions = {
        fetchPolicy: 'network-only'
    };

    // Accordions whose query handler declares `handlesSearch` perform search in place (with their own
    // optimized endpoint) instead of delegating to the generic full-text `picker-search` handler.
    let effectiveMode = options.mode;
    if (options.mode === Constants.mode.SEARCH && options.preSearchMode) {
        const preSearchAccordion = getAccordionItem(registry.get('accordionItem', options.preSearchMode), accordionItemProps);
        if (preSearchAccordion?.tableConfig?.queryHandler?.handlesSearch) {
            effectiveMode = options.preSearchMode;
        }
    }

    const tableConfig = getAccordionItem(registry.get('accordionItem', effectiveMode), accordionItemProps).tableConfig;

    options = {...defaultOptions, ...tableConfig, ...options};

    const queryHandler = options.queryHandler;
    // Dedupe by reference: when an accordion handles search in place, its fragments arrive both from the
    // query handler and from the caller's additional fragments (same singleton objects).
    const allFragments = [...new Set([...((queryHandler.getFragments && queryHandler.getFragments()) || []), ...(fragments || [])])];

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
