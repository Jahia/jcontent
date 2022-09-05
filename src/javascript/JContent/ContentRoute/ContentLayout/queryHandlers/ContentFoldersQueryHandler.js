import {BaseQueryHandler} from './BaseQueryHandler';
import JContentConstants from '~/JContent/JContent.constants';
import {BaseDescendantsQuery} from './BaseQueryHandler.gql-queries';
import {BaseTreeQueryHandler} from '~/JContent/ContentRoute/ContentLayout/queryHandlers/BaseTreeQueryHandler';

export const ContentFoldersQueryHandler = {
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
        const queryVariables = BaseQueryHandler.getQueryVariables(selection);
        queryVariables.typeFilter = ['jnt:content', 'jnt:contentFolder'];
        if (selection.tableView.viewMode === JContentConstants.tableView.viewMode.STRUCTURED) {
            queryVariables.fieldGrouping = null;
            queryVariables.offset = 0;
            queryVariables.limit = 10000;

            queryVariables.recursionTypesFilter = {multi: 'NONE', types: ['jnt:contentFolder']};
            queryVariables.typeFilter = ['jnt:content'];
        }

        return queryVariables;
    },

    isStructured: ({tableView}) => tableView.viewMode === JContentConstants.tableView.viewMode.STRUCTURED
};
