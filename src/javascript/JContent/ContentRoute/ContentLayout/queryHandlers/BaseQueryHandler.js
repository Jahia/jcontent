import {BaseChildrenQuery} from '~/JContent/ContentRoute/ContentLayout/queryHandlers/BaseQueryHandler.gql-queries';

export const BaseQueryHandler = {
    getQuery() {
        return BaseChildrenQuery;
    },

    getResultsPath(data) {
        return data && data.jcr && data.jcr.nodeByPath && data.jcr.nodeByPath.children;
    },

    getFragments() {
        return [];
    },

    getQueryParams({path, lang, uilang, pagination, typeFilter, recursionTypesFilter, sort, fieldGrouping}) {
        return {
            path: path,
            language: lang,
            displayLanguage: uilang,
            offset: pagination.currentPage * pagination.pageSize,
            limit: pagination.pageSize,
            typeFilter: typeFilter || ['jnt:content'],
            fieldSorter: sort.orderBy === '' ? null : {
                sortType: sort.order === '' ? null : (sort.order === 'DESC' ? 'ASC' : 'DESC'),
                fieldName: sort.orderBy === '' ? null : sort.orderBy,
                ignoreCase: true
            },
            recursionTypesFilter: recursionTypesFilter || {multi: 'NONE', types: ['nt:base']},
            fieldGrouping: fieldGrouping
        };
    }
};
