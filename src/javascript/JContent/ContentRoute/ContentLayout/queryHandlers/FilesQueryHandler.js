import {BaseQueryHandler} from './BaseQueryHandler';
import {imageFields, usagesCount} from './FilesQueryHandler.gql-queries';

export const FilesQueryHandler = {
    ...BaseQueryHandler,

    getQueryVariables: selection => ({
        ...BaseQueryHandler.getQueryVariables(selection),
        includeUsageCounts: true,
        fieldGrouping: {
            fieldName: 'primaryNodeType.name',
            groups: ['jnt:folder'],
            groupingType: 'START'
        }
    }),

    getFragments: () => [imageFields, usagesCount]
};
