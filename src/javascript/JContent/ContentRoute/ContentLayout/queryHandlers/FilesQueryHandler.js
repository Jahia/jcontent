import {BaseQueryHandler} from './BaseQueryHandler';
import {BaseCriteriaChildrenQuery} from './BaseQueryHandler.gql-queries';
import {imageFields, usagesCount} from './FilesQueryHandler.gql-queries';

export const FilesQueryHandler = {
    ...BaseQueryHandler,

    // While a filter is active, the list holds the files only: no single type covers jnt:file and jnt:folder and nothing else
    getQuery: options => (options?.nodeConstraint ? BaseCriteriaChildrenQuery : BaseQueryHandler.getQuery()),

    getResults: (data, options) => (options?.nodeConstraint ? data?.jcr?.nodesByCriteria : BaseQueryHandler.getResults(data, options)),

    getQueryVariables: selection => ({
        ...BaseQueryHandler.getQueryVariables(selection),
        fieldGrouping: {
            fieldName: 'primaryNodeType.name',
            groups: ['jnt:folder'],
            groupingType: 'START'
        },
        ...(selection.nodeConstraint && {nodeType: 'jnt:file', nodeConstraint: selection.nodeConstraint})
    }),

    getFragments: () => [imageFields, usagesCount],

    supportsFilters: () => true
};
