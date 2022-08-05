import {shallowEqual, useSelector} from 'react-redux';
import JContentConstants from '~/JContent/JContent.constants';
import {useQuery} from 'react-apollo';
import {
    SearchQueryHandler,
    Sql2SearchQueryHandler
} from '~/JContent/ContentRoute/ContentLayout/ContentLayout.gql-queries';
import {registry} from '@jahia/ui-extender';
import {replaceFragmentsInDocument} from '@jahia/data-helper';

const contentQueryHandlerByMode = mode => {
    switch (mode) {
        case JContentConstants.mode.SEARCH:
            return SearchQueryHandler;
        case JContentConstants.mode.SQL2SEARCH:
            return Sql2SearchQueryHandler;
        default:
            return registry.get('accordionItem', mode).queryHandler;
    }
};

export function useLayoutQuery(selector, options, fragments) {
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

    const queryHandler = contentQueryHandlerByMode(mode);
    const layoutQuery = replaceFragmentsInDocument(queryHandler.getQuery(), fragments);
    const rootPath = `/sites/${siteKey}`;

    const isStructuredView = tableView.viewMode === JContentConstants.tableView.viewMode.STRUCTURED;

    let layoutQueryParams = queryHandler.getQueryParams({
        path,
        uilang,
        lang,
        urlParams: params,
        rootPath,
        pagination,
        sort,
        viewType: tableView.viewType,
        viewMode: tableView.viewMode,
        mode
    });

    const {data, error, loading, refetch} = useQuery(layoutQuery, {
        variables: layoutQueryParams,
        fetchPolicy
    });
    return {queryHandler, layoutQuery, isStructuredView, layoutQueryParams, data, error, loading, refetch};
}
