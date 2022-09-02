import {BaseQueryHandler} from './BaseQueryHandler';
import {imageFields} from './FilesQueryHandler.gql-queries';

export const FilesQueryHandler = {
    ...BaseQueryHandler,

    getQueryVariables: selection => ({
        ...BaseQueryHandler.getQueryVariables(selection),
        typeFilter: ['jnt:file', 'jnt:folder']
    }),

    getFragments: () => [imageFields]
};
