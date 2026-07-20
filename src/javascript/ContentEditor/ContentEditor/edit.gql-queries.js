import gql from 'graphql-tag';
import {PredefinedFragments} from '@jahia/data-helper';
import {ContentEditorFragment} from './fragments';

const NodeDataFragment = {
    nodeData: {
        variables: {
            uilang: 'String!',
            language: 'String!',
            uuid: 'String!',
            writePermission: 'String!',
            childrenFilterTypes: '[String]!'
        },
        applyFor: 'node',
        gql: gql`fragment NodeData on JCRQuery {
            result:nodeById(uuid: $uuid) {
                ...NodeCacheRequiredFields
                lockedAndCannotBeEdited
                site {
                    ...NodeCacheRequiredFields
                    name
                }
                isSite: isNodeType(type: {multi: ANY, types: ["jnt:virtualsite"]})
                isPage: isNodeType(type: {multi: ANY, types: ["jnt:page"]})
                isFolder:isNodeType(type: {multi: ANY, types: ["jnt:contentFolder", "jnt:folder"]})
                isFile: isNodeType(type: {types: ["jnt:file"]})
                isSystemNameReadOnlyMixin: isNodeType(type: {multi: ANY, types: ["jmix:systemNameReadonly"]})
                moveSystemNameToTop: isNodeType(type: {multi: ANY, types: [
                    "jnt:page",
                    "jnt:contentFolder",
                    "jnt:folder",
                    "jnt:file",
                    "jnt:category",
                    "jmix:mainResource"
                ]})
                jView: property(name: "j:view") {
                    value
                }
                displayableNode {
                    ...NodeCacheRequiredFields
                    path
                    isFolder:isNodeType(type: {multi: ANY, types: ["jnt:contentFolder", "jnt:folder"]})
                }
                pageAncestors: ancestors(fieldFilter: {filters: {fieldName: "primaryNodeType.name", evaluation: AMONG, values: ["jnt:page"]}}) {
                    ...NodeCacheRequiredFields
                    path
                }
                translationLanguages
                name
                displayName(language: $language)
                mixinTypes {
                    name
                }
                parent {
                    ...NodeCacheRequiredFields
                    displayName(language: $language)
                    path
                }
                children(typesFilter:{types: $childrenFilterTypes}) {
                    nodes {
                        ...NodeCacheRequiredFields
                        name
                        displayName(language: $language)
                        primaryNodeType {
                            name
                            displayName(language: $uilang)
                            icon
                            supertypes {
                                name
                            }
                        }
                    }
                }
                primaryNodeType {
                    name
                    displayName(language: $uilang)
                    properties {
                        name
                        requiredType
                    }
                    supertypes {
                        name
                        mixin
                    }
                    hasOrderableChildNodes
                }
                properties(language: $language) {
                    name
                    value
                    notZonedDateValue
                    decryptedValue
                    values
                    notZonedDateValues
                    decryptedValues
                    definition {
                        declaringNodeType {
                            name
                        }
                    }
                }
                hasWritePermission: hasPermission(permissionName: $writePermission)
                hasPublishPermission: hasPermission(permissionName: "publish")
                hasTranslatePermission: hasPermission(permissionName: "translateAction")
                hasStartPublicationWorkflowPermission: hasPermission(permissionName: "publication-start")
                lockInfo {
                    details(language: $language) {
                        owner
                        type
                    }
                }
                wipInfo{
                    status
                    languages
                }
                defaultWipInfo {
                    status
                    languages
                }
                content: descendant(relPath: "jcr:content") {
                    ...NodeCacheRequiredFields
                    mimeType: property(name: "jcr:mimeType") {
                        value
                    }
                }
                usagesCount: referenceCount(typesFilter: {types: ["jnt:workflowTask"], multi: NONE})
            }
        }
        ${PredefinedFragments.nodeCacheRequiredFields.gql}`
    }
};

export const EditFormQuery = gql`
    query editForm($uilang:String!, $language:String!, $uuid: String!, $writePermission: String!, $childrenFilterTypes: [String]!) {
        forms {
            editForm(uiLocale: $uilang, locale: $language, uuidOrPath: $uuid) {
                ...ContentEditorFragment
            }
        }
        jcr {
            ...NodeData
        }
    }
    ${ContentEditorFragment}
    ${NodeDataFragment.nodeData.gql}
`;
