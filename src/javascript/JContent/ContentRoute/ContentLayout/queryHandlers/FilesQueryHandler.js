import {BaseQueryHandler} from './BaseQueryHandler';
import {imageFields} from './FilesQueryHandler.gql-queries';

export const FilesQueryHandler = {
    ...BaseQueryHandler,

    getQueryVariables: selection => ({
        ...BaseQueryHandler.getQueryVariables(selection),
        fieldGrouping: {
            fieldName: 'primaryNodeType.name',
            groups: ['jnt:folder'],
            groupingType: 'START'
        }
    }),

    getFragments: () => [imageFields]
};
