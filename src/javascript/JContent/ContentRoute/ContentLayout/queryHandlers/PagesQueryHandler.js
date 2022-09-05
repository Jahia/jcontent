import JContentConstants from '~/JContent/JContent.constants';
import {BaseQueryHandler} from './BaseQueryHandler';
import {BaseDescendantsQuery} from './BaseQueryHandler.gql-queries';
import {BaseTreeQueryHandler} from '~/JContent/ContentRoute/ContentLayout/queryHandlers/BaseTreeQueryHandler';

export const PagesQueryHandler = {
    ...BaseQueryHandler,
    ...BaseTreeQueryHandler,

    getQuery: () => BaseDescendantsQuery,

    getTreeParams: selection => {
        const {openPaths, tableView} = selection;
        if (openPaths && tableView.viewMode === JContentConstants.tableView.viewMode.STRUCTURED) {
            return BaseTreeQueryHandler.getTreeParams(selection);
        }

        return null;
    },

    getQueryVariables: selection => {
        const {tableView, params} = selection;

        const queryVariables = BaseQueryHandler.getQueryVariables(selection);

        if (tableView.viewMode === JContentConstants.tableView.viewMode.STRUCTURED) {
            queryVariables.fieldGrouping = null;
            queryVariables.offset = 0;
            queryVariables.limit = 10000;

            if (tableView.viewType === JContentConstants.tableView.viewType.CONTENT) {
                queryVariables.recursionTypesFilter = {types: ['jnt:content']};
                queryVariables.typeFilter = ['jnt:content'];
            } else if (tableView.viewType === JContentConstants.tableView.viewType.PAGES) {
                queryVariables.recursionTypesFilter = {types: ['jnt:page']};
                queryVariables.typeFilter = ['jnt:page'];
            }
        } else if (params.sub) {
            queryVariables.typeFilter = ['jnt:content', 'jnt:contentFolder'];
        } else {
            queryVariables.typeFilter = JContentConstants.tableView.viewType.PAGES === tableView.viewType ? ['jnt:page'] : [JContentConstants.contentType];
            queryVariables.recursionTypesFilter = {multi: 'NONE', types: ['jnt:page', 'jnt:contentFolder']};
        }

        return queryVariables;
    },

    isStructured: ({tableView}) => tableView.viewMode === JContentConstants.tableView.viewMode.STRUCTURED
};
