import {BaseQueryHandler} from './BaseQueryHandler';
import {imageFields} from './FilesQueryHandler.gql-queries';

export const FilesQueryHandler = {
    ...BaseQueryHandler,

    getFragments: () => [imageFields]
};
