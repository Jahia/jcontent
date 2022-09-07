import {Sql2SearchQuery} from './Sql2SearchQueryHandler.gql-queries';
import {BaseQueryHandler} from '~/JContent/ContentRoute/ContentLayout/queryHandlers/BaseQueryHandler';

export const Sql2SearchQueryHandler = {
    ...BaseQueryHandler,

    getQuery: () => Sql2SearchQuery,

    getQueryVariables: ({uilang, lang, sql2SearchFrom, sql2SearchWhere, searchPath, pagination, sort}) => {
        let query = `SELECT * FROM [${sql2SearchFrom}] WHERE ISDESCENDANTNODE('${searchPath}')`;
        if (sql2SearchWhere && sql2SearchWhere !== '') {
            query += ` AND (${sql2SearchWhere})`;
        }

        return {
            query: query,
            language: lang,
            displayLanguage: uilang,
            offset: pagination.currentPage * pagination.pageSize,
            limit: pagination.pageSize,
            fieldSorter: sort.orderBy === '' ? null : {
                sortType: sort.order === '' ? null : (sort.order === 'DESC' ? 'DESC' : 'ASC'),
                fieldName: sort.orderBy === '' ? null : sort.orderBy,
                ignoreCase: true
            }
        };
    },

    getResults: data => data && data.jcr && data.jcr.nodesByQuery
};
