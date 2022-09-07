import {BaseQueryHandler} from './BaseQueryHandler';
import {imageFields} from './FilesQueryHandler.gql-queries';

export const FilesQueryHandler = {
    ...BaseQueryHandler,

    getQueryParams: selection => ({
        ...BaseQueryHandler.getQueryParams(selection),
        fieldGrouping: {
            fieldName: 'primaryNodeType.name',
            groups: ['jnt:folder'],
            groupingType: 'START'
        }
    }),

    getFragments: () => [imageFields]
};
