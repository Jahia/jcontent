import JContentConstants from '~/JContent/JContent.constants';
import {BaseQueryHandler} from './BaseQueryHandler';
import {BaseDescendantsQuery} from './BaseQueryHandler.gql-queries';

export const PagesQueryHandler = {
    ...BaseQueryHandler,
    getQuery() {
        return BaseDescendantsQuery;
    },
    getQueryParams({path, uilang, lang, pagination, sort, viewType, viewMode, params}) {
        let typeFilter = JContentConstants.tableView.viewType.PAGES === viewType ? ['jnt:page'] : [JContentConstants.contentType];
        let recursionTypesFilter = {multi: 'NONE', types: ['jnt:page', 'jnt:contentFolder']};

        if (params.sub) {
            typeFilter = ['jnt:content', 'jnt:contentFolder'];
            recursionTypesFilter = {multi: 'NONE', types: ['nt:base']};
        }

        const layoutQueryParams = BaseQueryHandler.getQueryParams({
            path,
            lang,
            uilang,
            pagination,
            sort,
            typeFilter,
            recursionTypesFilter
        });

        if (viewMode === JContentConstants.tableView.viewMode.STRUCTURED) {
            layoutQueryParams.fieldGrouping = null;
            layoutQueryParams.offset = 0;
            layoutQueryParams.limit = 10000;

            if (viewType === JContentConstants.tableView.viewType.CONTENT) {
                layoutQueryParams.recursionTypesFilter = {types: ['jnt:content']};
                layoutQueryParams.typeFilter = ['jnt:content'];
            } else if (viewType === JContentConstants.tableView.viewType.PAGES) {
                layoutQueryParams.recursionTypesFilter = {types: ['jnt:page']};
                layoutQueryParams.typeFilter = ['jnt:page'];
            }
        }

        return layoutQueryParams;
    }
};
