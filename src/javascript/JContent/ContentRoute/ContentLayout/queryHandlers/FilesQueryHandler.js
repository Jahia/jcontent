import {BaseQueryHandler} from './BaseQueryHandler';
import {imageFields} from '~/JContent/ContentRoute/ContentLayout/queryHandlers/FilesQueryHandler.gql-queries';

export const FilesQueryHandler = {
    ...BaseQueryHandler,

    getQueryParams({path, uilang, lang, pagination, sort}) {
        return BaseQueryHandler.getQueryParams({path, lang, uilang, pagination, sort, typeFilter: ['jnt:file', 'jnt:folder']});
    },

    getFragments() {
        return [imageFields];
    },

    getResultsPath(data) {
        return data && data.jcr && data.jcr.nodeByPath && data.jcr.nodeByPath.children;
    }
};
