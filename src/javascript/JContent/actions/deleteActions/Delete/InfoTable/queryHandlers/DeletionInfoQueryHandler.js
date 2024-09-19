import {BaseTreeQueryHandler} from '~/JContent/ContentRoute/ContentLayout/queryHandlers';
import gql from 'graphql-tag';

export const DeletionInfoQueryHandler = {
    ...BaseTreeQueryHandler,

    getTreeParams: ({paths, openPaths = [], openableTypes = ['jnt:content', 'jnt:page', 'jnt:file', 'jnt:folder', 'jnt:category'], selectableTypes = []}) => ({
        rootPaths: paths,
        openPaths: [...new Set([...openPaths])],
        selectedPaths: [],
        openableTypes,
        selectableTypes,
        hideRoot: false
    }),

    getFragments() {
        return [
            {
                applyFor: 'node',
                gql: gql`fragment UsagesFragment on JCRNode {
                    usagesCount: referenceCount(typesFilter: {types: ["jnt:workflowTask"], multi: NONE})
                }`
            }
        ];
    },

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
