import {BaseQueryHandler} from './BaseQueryHandler';
import {imageFields} from './FilesQueryHandler.gql-queries';

export const FilesQueryHandler = {
    ...BaseQueryHandler,

    getQueryParams: selection => ({
        ...BaseQueryHandler.getQueryParams(selection),
        typeFilter: ['jnt:file', 'jnt:folder'],
        fieldGrouping: {
            fieldName: 'primaryNodeType.name',
            groups: ['jnt:folder'],
            groupingType: 'START'
        }
    }),

    getFragments: () => [imageFields]
};
