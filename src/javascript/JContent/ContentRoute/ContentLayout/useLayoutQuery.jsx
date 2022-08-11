import {shallowEqual, useSelector} from 'react-redux';
import JContentConstants from '~/JContent/JContent.constants';
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

    const {mode, siteKey, path, lang, uilang, params, pagination, sort, tableView} = useSelector(selector, shallowEqual);
    const {fetchPolicy} = {...defaultOptions, ...options};

    const queryHandler = registry.get('accordionItem', mode).queryHandler;
    const layoutQuery = replaceFragmentsInDocument(queryHandler.getQuery(), [...(queryHandler.getFragments && queryHandler.getFragments()) || [], ...(fragments || [])]);
    const rootPath = `/sites/${siteKey}`;

    const isStructuredView = tableView.viewMode === JContentConstants.tableView.viewMode.STRUCTURED;

    let layoutQueryParams = queryHandler.getQueryParams({
        path,
        uilang,
        lang,
        params,
        rootPath,
        pagination,
        sort,
        viewType: tableView.viewType,
        viewMode: tableView.viewMode,
        mode
    });

    const {data, error, loading, refetch} = useQuery(layoutQuery, {
        variables: {...layoutQueryParams, ...queryVariables},
        fetchPolicy
    });
    return {queryHandler, layoutQuery, isStructuredView, layoutQueryParams, data, error, loading, refetch};
}
