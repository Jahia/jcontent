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
        } else {
            layoutQueryParams.fieldGrouping = {
                fieldName: 'primaryNodeType.name',
                groups: ['jnt:contentFolder'],
                groupingType: 'START'
            };
        }

        return layoutQueryParams;
    },

    isStructured: ({tableView}) => tableView.viewMode === JContentConstants.tableView.viewMode.STRUCTURED
};
