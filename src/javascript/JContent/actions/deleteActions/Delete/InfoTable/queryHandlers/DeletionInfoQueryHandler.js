import {BaseTreeQueryHandler} from '~/JContent/ContentRoute/ContentLayout/queryHandlers';

export const DeletionInfoQueryHandler = {
    ...BaseTreeQueryHandler,

    getTreeParams: ({paths, openPaths = [], openableTypes = ['jnt:content', 'jnt:page', 'jnt:file', 'jnt:folder'], selectableTypes = []}) => ({
        rootPaths: paths,
        openPaths: [...new Set([...openPaths])],
        selectedPaths: [],
        openableTypes,
        selectableTypes,
        hideRoot: false
    }),

    getQueryVariables({lang, uilang}) {
        return {
            fieldSorter: {sortType: 'DESC', fieldName: 'lastModified.value', ignoreCase: true},
            sortBy: {sortType: 'DESC', fieldName: 'lastModified.value', ignoreCase: true},
            language: lang,
            displayLanguage: uilang,
            typeFilter: ['jnt:content', 'jnt:page']
        };
    }
};
