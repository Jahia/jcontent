import JContentConstants from '~/JContent/JContent.constants';
import {BaseQueryHandler} from './BaseQueryHandler';
import {BaseDescendantsQuery} from './BaseQueryHandler.gql-queries';
import {BaseTreeQueryHandler} from '~/JContent/ContentRoute/ContentLayout/queryHandlers/BaseTreeQueryHandler';

export const PagesQueryHandler = {
    ...BaseQueryHandler,
    ...BaseTreeQueryHandler,

    getQuery: () => BaseDescendantsQuery,

    structureTreeEntries: (treeEntries, {hideRoot}) => {
        // Filter out internal/external links and menu titles off the tree
        const typesToFilterOut = ['jnt:nodeLink', 'jnt:externalLink', 'jnt:navMenuText'];
        const filteredTreeEntries = treeEntries.filter(entry => !typesToFilterOut.includes(entry.node.primaryNodeType.name));

        return BaseTreeQueryHandler.structureTreeEntries(filteredTreeEntries, {hideRoot});
    },

    getTreeParams: options => {
        const {openPaths, tableView} = options;
        if (openPaths && tableView.viewMode === JContentConstants.tableView.viewMode.STRUCTURED && tableView.viewType === JContentConstants.tableView.viewType.CONTENT) {
            return BaseTreeQueryHandler.getTreeParams(options);
        }

        return null;
    },

    getQueryVariables: options => {
        const {tableView, subContent} = options;

        const queryVariables = BaseQueryHandler.getQueryVariables(options);

        if (tableView.viewMode === JContentConstants.tableView.viewMode.STRUCTURED) {
            if (tableView.viewType === JContentConstants.tableView.viewType.CONTENT) {
                queryVariables.typeFilter = ['jnt:content'];
            } else if (tableView.viewType === JContentConstants.tableView.viewType.PAGES) {
                queryVariables.typeFilter = ['jnt:page'];
            }
        } else if (subContent) {
            queryVariables.typeFilter = ['jnt:content', 'jnt:contentFolder'];
        } else {
            queryVariables.typeFilter = JContentConstants.tableView.viewType.PAGES === tableView.viewType ? ['jnt:page'] : ['jmix:editorialContent'];
            queryVariables.recursionTypesFilter = {
                multi: 'NONE',
                types: ['jnt:page', 'jnt:contentFolder', 'jnt:folder', 'jnt:usersFolder', 'jnt:groupsFolder']};
        }

        return queryVariables;
    },

    isStructured: ({tableView}) => tableView.viewMode === JContentConstants.tableView.viewMode.STRUCTURED && tableView.viewType === JContentConstants.tableView.viewType.CONTENT
};
