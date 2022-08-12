import {BaseQueryHandler} from './BaseQueryHandler';
import JContentConstants from '~/JContent/JContent.constants';

export const ContentQueryHandlerContentFolders = {
    ...BaseQueryHandler,
    getQueryParams({path, uilang, lang, pagination, sort, viewMode}) {
        const typeFilter = ['jnt:content', 'jnt:contentFolder'];

        const layoutQueryParams = BaseQueryHandler.getQueryParams({
            path,
            lang,
            uilang,
            pagination,
            sort,
            typeFilter
        });

        if (viewMode === JContentConstants.tableView.viewMode.STRUCTURED) {
            layoutQueryParams.fieldGrouping = null;
            layoutQueryParams.offset = 0;
            layoutQueryParams.limit = 10000;

            layoutQueryParams.recursionTypesFilter = {multi: 'NONE', types: ['jnt:contentFolder']};
            layoutQueryParams.typeFilter = ['jnt:content'];
        }

        return layoutQueryParams;
    }
};
