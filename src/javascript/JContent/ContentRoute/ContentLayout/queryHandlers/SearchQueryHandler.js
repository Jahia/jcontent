import {SearchQuery} from './SearchQueryHandler.gql-queries';
import {BaseQueryHandler} from '~/JContent/ContentRoute/ContentLayout/queryHandlers/BaseQueryHandler';
import {imageFields} from './FilesQueryHandler.gql-queries';

export const SearchQueryHandler = {
    ...BaseQueryHandler,

    getQuery: () => SearchQuery,

    getQueryVariables: ({uilang, lang, searchPath, searchContentType, searchTerms, pagination, sort}) => ({
        searchPath,
        nodeType: (searchContentType || 'jmix:searchable'),
        searchTerms,
        // LOWER_CASE on the j:nodename LIKE constraint lowercases the column server-side, so the
        // pattern must be lowercased too for the match to work — keeps file-name search case-insensitive
        // and consistent with the (analyzer-based) content search.
        nodeNameSearchTerms: `%${(searchTerms || '').toLowerCase()}%`,
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
        },
        doSearch: Boolean(searchTerms)
    }),

    getResults: (data, {searchTerms}) => searchTerms ? (data && data.jcr && data.jcr.nodesByCriteria) : {nodes: [], pageInfo: {totalCount: 0}},

    getFragments: () => [imageFields]
};
