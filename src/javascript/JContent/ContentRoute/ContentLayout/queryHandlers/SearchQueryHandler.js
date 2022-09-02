import {SearchQuery} from './SearchQueryHandler.gql-queries';
import {BaseQueryHandler} from '~/JContent/ContentRoute/ContentLayout/queryHandlers/BaseQueryHandler';

export const SearchQueryHandler = {
    ...BaseQueryHandler,

    getQuery: () => SearchQuery,

    getQueryVariables: ({uilang, lang, params, pagination, sort}) => ({
        searchPath: params.searchPath,
        nodeType: (params.searchContentType || 'jmix:searchable'),
        searchTerms: params.searchTerms,
        nodeNameSearchTerms: `%${params.searchTerms}%`,
        language: lang,
        displayLanguage: uilang,
        offset: pagination.currentPage * pagination.pageSize,
        limit: pagination.pageSize,
        fieldSorter: sort.orderBy === '' ? null : {
            sortType: sort.order === '' ? null : (sort.order === 'DESC' ? 'DESC' : 'ASC'),
            fieldName: sort.orderBy === '' ? null : sort.orderBy,
            ignoreCase: true
        },
        fieldFilter: {
            filters: [],
            multi: 'NONE'
        }
    }),

    getResults: data => data && data.jcr && data.jcr.nodesByCriteria
};
