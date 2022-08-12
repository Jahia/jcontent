import {BaseQueryHandler} from './BaseQueryHandler';
import {imageFields} from './FilesQueryHandler.gql-queries';

export const FilesQueryHandler = {
    ...BaseQueryHandler,

    getQueryParams({path, uilang, lang, pagination, sort}) {
        return BaseQueryHandler.getQueryParams({path, lang, uilang, pagination, sort, typeFilter: ['jnt:file', 'jnt:folder']});
    },

    getFragments() {
        return [imageFields];
    }
};
