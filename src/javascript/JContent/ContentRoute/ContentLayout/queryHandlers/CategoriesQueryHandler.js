import {BaseQueryHandler} from './BaseQueryHandler';
import JContentConstants from '~/JContent/JContent.constants';
import {BaseDescendantsQuery} from './BaseQueryHandler.gql-queries';
import {BaseTreeQueryHandler} from '~/JContent/ContentRoute/ContentLayout/queryHandlers/BaseTreeQueryHandler';

export const CategoriesQueryHandler = {
    ...BaseQueryHandler,
    ...BaseTreeQueryHandler,

    structureTreeEntries: (treeEntries, options) => {
        treeEntries.forEach(entry => {
            if (entry.node.primaryNodeType.name === 'jnt:category') {
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

        return {
            ...BaseQueryHandler.getQueryVariables(options),
            fieldGrouping: {
                fieldName: 'primaryNodeType.name',
                groups: ['jnt:category'],
                groupingType: 'START'
            }
        };
    },

    isStructured: ({tableView}) => tableView.viewMode === JContentConstants.tableView.viewMode.STRUCTURED
};
