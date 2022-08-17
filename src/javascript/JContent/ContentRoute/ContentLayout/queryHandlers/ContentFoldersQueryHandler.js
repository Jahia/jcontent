import {BaseQueryHandler} from './BaseQueryHandler';
import JContentConstants from '~/JContent/JContent.constants';
import {BaseDescendantsQuery} from './BaseQueryHandler.gql-queries';

export const ContentFoldersQueryHandler = {
    ...BaseQueryHandler,

    getQuery: () => BaseDescendantsQuery,

    getQueryParams: selection => {
        const layoutQueryParams = BaseQueryHandler.getQueryParams(selection);
        layoutQueryParams.typeFilter = ['jnt:content', 'jnt:contentFolder'];
        if (selection.tableView.viewMode === JContentConstants.tableView.viewMode.STRUCTURED) {
            layoutQueryParams.fieldGrouping = null;
            layoutQueryParams.offset = 0;
            layoutQueryParams.limit = 10000;

            layoutQueryParams.recursionTypesFilter = {multi: 'NONE', types: ['jnt:contentFolder']};
            layoutQueryParams.typeFilter = ['jnt:content'];
        }

        return layoutQueryParams;
    },

    getResults: (data, {tableView, path}) => {
        const result = BaseQueryHandler.getResults(data);
        if (tableView.viewMode === JContentConstants.tableView.viewMode.STRUCTURED) {
            return BaseQueryHandler.structureData(path, result);
        }

        return result;
    }
};
