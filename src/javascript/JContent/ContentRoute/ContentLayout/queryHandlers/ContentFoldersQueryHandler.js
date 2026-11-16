import {BaseQueryHandler} from './BaseQueryHandler';
import JContentConstants from '~/JContent/JContent.constants';
import {BaseCriteriaChildrenQuery, BaseDescendantsQuery} from './BaseQueryHandler.gql-queries';
import {BaseTreeQueryHandler} from '~/JContent/ContentRoute/ContentLayout/queryHandlers/BaseTreeQueryHandler';

const isFlatList = ({tableView}) => tableView?.viewMode !== JContentConstants.tableView.viewMode.STRUCTURED;

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

    // While a filter is active, the flat list lists the direct children with nodesByCriteria, which takes the constraint
    getQuery: options => (options?.nodeConstraint && isFlatList(options) ? BaseCriteriaChildrenQuery : BaseDescendantsQuery),

    getResults: (data, options) => (options?.nodeConstraint && isFlatList(options) ?
        data?.jcr?.nodesByCriteria :
        BaseQueryHandler.getResults(data, options)),

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
                groups: ['jnt:contentFolder'],
                groupingType: 'START'
            },
            // The type jnt:contentFolder extends jnt:content, so one type covers both
            ...(options.nodeConstraint && {nodeType: 'jnt:content', nodeConstraint: options.nodeConstraint})
        };
    },

    supportsFilters: isFlatList,

    isStructured: ({tableView}) => tableView.viewMode === JContentConstants.tableView.viewMode.STRUCTURED
};
