import {BaseTreeQueryHandler} from '~/JContent/ContentRoute/ContentLayout/queryHandlers';
import gql from 'graphql-tag';

export const DeletionInfoQueryHandler = {
    ...BaseTreeQueryHandler,

    getTreeParams: ({paths, openPaths = [], openableTypes = ['jnt:content', 'jnt:page'], selectableTypes = []}) => ({
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
                    usages: references(fieldFilter: {filters: {fieldName: "node.visible", value: "true"}}) {
                        nodes {
                            node {
                                ...NodeCacheRequiredFields
                                visible: isNodeType(type: {types: ["jnt:workflowTask"], multi: NONE})
                            }
                        }
                        pageInfo {
                            nodesCount
                        }
                    }
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
