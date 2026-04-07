import gql from 'graphql-tag';
import {PredefinedFragments} from '@jahia/data-helper';

export const VisibilityQuery = gql`query($path:String!) {
    jcr {
        nodeByPath(path: $path) {
            ...NodeCacheRequiredFields
            rules: descendants(typesFilter:{types: ["jnt:condition"], multi: ALL}) {
                pageInfo {
                    totalCount
                }
                nodes {
                    ...NodeCacheRequiredFields
                    primaryNodeType {
                        name
                    }
                    properties {
                        name
                        values
                        value
                    }
                    aggregatedPublicationInfo(language: "en") {
                        existsInLive
                        publicationStatus
                    }
                    ancestors(
                        fieldFilter: {filters: {fieldName: "primaryNodeType.name", value: "jnt:conditionalVisibility", evaluation: EQUAL}}
                    ) {
                        ...NodeCacheRequiredFields
                        aggregatedPublicationInfo(language: "en") {
                            existsInLive
                            publicationStatus
                        }
                    }
                }
            }
            invalidLanguages: property(name:"j:invalidLanguages") {
                values
            }
        }
    }
}

${PredefinedFragments.nodeCacheRequiredFields.gql}
`;


export const UpdateVisibilityRulesMutation = gql`mutation updateVisibilityRules($uuid: String!, $lang: String!,
            $newConditions: [InputVisibilityConditionInput], $updatedConditions: [InputVisibilityConditionInput], 
            $removedConditions: [String]) {
    forms {
        saveVisibilityCondition(uuid: $uuid, locale: $lang, newConditions: $newConditions, updatedConditions: $updatedConditions, removedConditions: $removedConditions)
    }
}`;
