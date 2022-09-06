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

    getQueryVariables: selection => ({
        ...BaseQueryHandler.getQueryVariables(selection),
        typeFilter: ['jnt:content', 'jnt:contentFolder']
    }),

    isStructured: ({tableView}) => tableView.viewMode === JContentConstants.tableView.viewMode.STRUCTURED
};
