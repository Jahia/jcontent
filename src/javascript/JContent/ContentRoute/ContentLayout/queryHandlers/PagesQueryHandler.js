import JContentConstants from '~/JContent/JContent.constants';
import {BaseQueryHandler} from './BaseQueryHandler';
import {BaseDescendantsQuery} from './BaseQueryHandler.gql-queries';

export const PagesQueryHandler = {
    ...BaseQueryHandler,

    getQuery: () => BaseDescendantsQuery,

    getQueryParams: selection => {
        const {tableView, params} = selection;

        const layoutQueryParams = BaseQueryHandler.getQueryParams(selection);

        if (tableView.viewMode === JContentConstants.tableView.viewMode.STRUCTURED) {
            layoutQueryParams.fieldGrouping = null;
            layoutQueryParams.offset = 0;
            layoutQueryParams.limit = 10000;

            if (tableView.viewType === JContentConstants.tableView.viewType.CONTENT) {
                layoutQueryParams.recursionTypesFilter = {types: ['jnt:content']};
                layoutQueryParams.typeFilter = ['jnt:content'];
            } else if (tableView.viewType === JContentConstants.tableView.viewType.PAGES) {
                layoutQueryParams.recursionTypesFilter = {types: ['jnt:page']};
                layoutQueryParams.typeFilter = ['jnt:page'];
            }
        } else if (params.sub) {
            layoutQueryParams.typeFilter = ['jnt:content', 'jnt:contentFolder'];
        } else {
            layoutQueryParams.typeFilter = JContentConstants.tableView.viewType.PAGES === tableView.viewType ? ['jnt:page'] : [JContentConstants.contentType];
            layoutQueryParams.recursionTypesFilter = {multi: 'NONE', types: ['jnt:page', 'jnt:contentFolder']};
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
