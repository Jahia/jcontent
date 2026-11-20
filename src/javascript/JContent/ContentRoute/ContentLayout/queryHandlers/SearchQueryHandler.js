import {SearchQuery} from './SearchQueryHandler.gql-queries';
import {BaseQueryHandler} from '~/JContent/ContentRoute/ContentLayout/queryHandlers/BaseQueryHandler';
import {imageFields} from './FilesQueryHandler.gql-queries';

/**
 * The constraint of the search terms: the full text, the tags or the system name.
 * LOWER_CASE on the j:nodename LIKE constraint lowercases the column server-side, so the
 * pattern must be lowercased too for the match to work — keeps file-name search case-insensitive
 * and consistent with the (analyzer-based) content search.
 */
export const searchTermsConstraint = searchTerms => ({
    any: [
        {contains: searchTerms},
        {contains: searchTerms, property: 'j:tagList'},
        {like: `%${(searchTerms || '').toLowerCase()}%`, property: 'j:nodename', function: 'LOWER_CASE'}
    ]
});

export const SearchQueryHandler = {
    ...BaseQueryHandler,

    getQuery: () => SearchQuery,

    getQueryVariables: ({uilang, lang, searchPath, searchContentType, searchTerms, pagination, sort, nodeConstraint}) => ({
        searchPath,
        nodeType: (searchContentType || 'jmix:searchable'),
        nodeConstraint: nodeConstraint ? {all: [searchTermsConstraint(searchTerms), nodeConstraint]} : searchTermsConstraint(searchTerms),
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

    getFragments: () => [imageFields],

    supportsFilters: () => true
};
