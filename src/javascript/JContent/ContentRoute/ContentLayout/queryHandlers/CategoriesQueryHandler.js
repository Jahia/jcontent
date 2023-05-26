import {BaseQueryHandler} from './BaseQueryHandler';

export const CategoriesQueryHandler = {
    ...BaseQueryHandler,

    getQueryVariables: selection => ({
        ...BaseQueryHandler.getQueryVariables(selection),
        fieldGrouping: {
            fieldName: 'primaryNodeType.name',
            groups: ['jnt:category'],
            groupingType: 'START'
        }
    })

};
