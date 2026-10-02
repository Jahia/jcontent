import {BaseQueryHandler} from './BaseQueryHandler';
import {BaseTreeQueryHandler} from './BaseTreeQueryHandler';
import {BaseDescendantsQuery} from './BaseQueryHandler.gql-queries';
import JContentConstants from '~/JContent/JContent.constants';
import {SORT_CONTENT_TREE_BY_NAME_ASC} from '~/JContent/ContentTree/ContentTree.constants';

const isTree = ({openPaths, tableView}) => Boolean(openPaths) &&
    tableView.viewMode === JContentConstants.tableView.viewMode.STRUCTURED;

export const CategoriesQueryHandler = {
    ...BaseQueryHandler,
    ...BaseTreeQueryHandler,

    getQuery: () => BaseDescendantsQuery,

    // In structured mode the table renders the whole category tree. Children are fetched branch by
    // branch as rows are expanded (useTreeEntries only queries the opened paths), so opening the
    // categories app never loads more than the levels the user actually sees.
    getTreeParams: options => {
        if (!isTree(options)) {
            return null;
        }

        // BaseTreeQueryHandler drops sorting in structured mode (content keeps its authored order),
        // but categories have no meaningful authored order, so keep them alphabetical.
        return {
            ...BaseTreeQueryHandler.getTreeParams(options),
            sortBy: SORT_CONTENT_TREE_BY_NAME_ASC
        };
    },

    getQueryVariables: options => {
        if (isTree(options)) {
            return {
                ...BaseTreeQueryHandler.getQueryVariables(options),
                typeFilter: ['jnt:category']
            };
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

    isStructured: options => isTree(options)
};
