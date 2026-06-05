import gql from 'graphql-tag';
import {PredefinedFragments} from '@jahia/data-helper';

export const VisibilityQuery = gql`query($path:String!, $language: String!) {
    jcr {
        nodeByPath(path: $path) {
            ...NodeCacheRequiredFields
            isVisible
            liveVisibility: nodeInWorkspace(workspace: LIVE) {
                ...NodeCacheRequiredFields
                isVisible
                visibilityDetails {
                    matches
                    conditionNode {
                        ...NodeCacheRequiredFields
                        primaryNodeType {
                            name
                        }
                        properties {
                            name
                            values
                            value
                        }
                    }
                }
            }
            visibilityDetails {
                matches
                conditionNode {
                    ...NodeCacheRequiredFields
                    primaryNodeType {
                        name
                    }
                    properties {
                        name
                        values
                        value
                    }
                }
            }
            conditionalVisibility : children(names: ["j:conditionalVisibility"]) {
                nodes {
                    ...NodeCacheRequiredFields
                    isMatchingAllConditions: property(language: $language, name: "j:forceMatchAllConditions") {
                        booleanValue
                    }
                }
            }
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
                    isConditionMatching
                    live: nodeInWorkspace(workspace: LIVE) {
                        ...NodeCacheRequiredFields
                        properties {
                            name
                            value
                            values
                        }
                        isConditionMatching
                    }
                    aggregatedPublicationInfo(language: $language) {
                        existsInLive
                        publicationStatus
                    }
                    operationsSupport {
                        lock
                        markForDeletion
                        publication
                    }
                    ancestors(
                        fieldFilter: {filters: {fieldName: "primaryNodeType.name", value: "jnt:conditionalVisibility", evaluation: EQUAL}}
                    ) {
                        ...NodeCacheRequiredFields
                        aggregatedPublicationInfo(language: $language) {
                            existsInLive
                            publicationStatus
                        }
                        operationsSupport {
                            lock
                            markForDeletion
                            publication
                        }
                        lastModifiedBy: property(name: "jcr:lastModifiedBy", language: $language) {
                            value
                        }
                        lastModified: property(name: "jcr:lastModified", language: $language) {
                            value
                        }
                        lastPublished: property(name: "j:lastPublished", language: $language) {
                            value
                        }
                        lastPublishedBy: property(name: "j:lastPublishedBy", language: $language) {
                            value
                        }
                        deletedBy: property(name: "j:deletionUser", language: $language) {
                            value
                        }
                        deleted: property(name: "j:deletionDate", language: $language) {
                            value
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
            $removedConditions: [String], $isMatchingAllConditions: Boolean!) {
    forms {
        saveVisibilityCondition(uuid: $uuid, locale: $lang, newConditions: $newConditions, updatedConditions: $updatedConditions, removedConditions: $removedConditions, isMatchingAllConditions: $isMatchingAllConditions)
    }
}`;
