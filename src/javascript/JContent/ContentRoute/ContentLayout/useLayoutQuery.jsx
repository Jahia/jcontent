import {shallowEqual, useSelector} from 'react-redux';
import {useQuery} from 'react-apollo';
import {registry} from '@jahia/ui-extender';
import {replaceFragmentsInDocument} from '@jahia/data-helper';

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
            tableView: state.jcontent.tableView
        });
    }

    const selection = useSelector(selector, shallowEqual);
    const {fetchPolicy} = {...defaultOptions, ...options};

    const queryHandler = registry.get('accordionItem', selection.mode).queryHandler;
    const layoutQuery = replaceFragmentsInDocument(queryHandler.getQuery(), [...(queryHandler.getFragments && queryHandler.getFragments()) || [], ...(fragments || [])]);

    let layoutQueryParams = queryHandler.getQueryParams(selection);

    const {data, error, loading, refetch} = useQuery(layoutQuery, {
        variables: {...layoutQueryParams, ...queryVariables},
        fetchPolicy
    });

    const result = data && queryHandler.getResults(data, selection);

    return {layoutQuery, layoutQueryParams, result, error, loading, refetch};
}
