import {BaseQueryHandler} from './BaseQueryHandler';
import JContentConstants from '~/JContent/JContent.constants';
import {BaseDescendantsQuery} from './BaseQueryHandler.gql-queries';
import {BaseTreeQueryHandler} from '~/JContent/ContentRoute/ContentLayout/queryHandlers/BaseTreeQueryHandler';

export const ContentFoldersQueryHandler = {
    ...BaseQueryHandler,
    ...BaseTreeQueryHandler,

    structureTreeEntries: (treeEntries, options) => {
        treeEntries.forEach(entry => {
            if (entry.node.primaryNodeType.name === 'jnt:contentFolder') {
                entry.openable = false;
            }
        });

        return BaseTreeQueryHandler.structureTreeEntries(treeEntries, options);
    },

    getQuery: () => BaseDescendantsQuery,

    getTreeParams: options => {
        const {openPaths, tableView} = options;
        if (openPaths && tableView.viewMode === JContentConstants.tableView.viewMode.STRUCTURED) {
            return BaseTreeQueryHandler.getTreeParams(options);
        }

        return null;
    },

    getQueryVariables: options => {
        const {openPaths, tableView} = options;
        if (openPaths && tableView.viewMode === JContentConstants.tableView.viewMode.STRUCTURED) {
            return BaseTreeQueryHandler.getQueryVariables(options);
        }

        return BaseQueryHandler.getQueryVariables(options);
    },

    isStructured: ({tableView}) => tableView.viewMode === JContentConstants.tableView.viewMode.STRUCTURED
};
