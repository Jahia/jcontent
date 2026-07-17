import gql from 'graphql-tag';
import {PredefinedFragments} from '@jahia/data-helper';

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

// The section → fieldSet → field selection shared by every editor-form query. Exported so other
// consumers (e.g. the content-versioning version-history panel, which renders a read-only snapshot
// form with the same shape) can spread it instead of copy-pasting the selection and drifting from it.
export const EditFormSectionsFragment = gql`
    fragment EditFormSections on GqlEditorForm {
        sections {
            name
            displayName
            description
            visible
            expanded
            fieldSets {
                name
                displayName
                description
                visible
                dynamic
                activated
                hasEnableSwitch
                readOnly
                fields {
                    name
                    displayName
                    description
                    errorMessage
                    visible
                    mandatory
                    i18n
                    multiple
                    readOnly
                    requiredType
                    selectorType
                    declaringNodeType
                    selectorOptions {
                        name
                        value
                        values
                    }
                    valueConstraints {
                        value {
                            type
                            string
                        }
                        displayValue
                        displayValueKey
                        properties {
                            name
                            value
                        }
                    }
                    defaultValues {
                        string
                    }
                }
            }
        }
    }
`;

export const EditFormQuery = gql`
    query editForm($uilang:String!, $language:String!, $uuid: String!, $writePermission: String!, $childrenFilterTypes: [String]!) {
        forms {
            editForm(uiLocale: $uilang, locale: $language, uuidOrPath: $uuid) {
                name
                displayName
                description
                hasPreview
                showAdvancedMode
                ...EditFormSections
            }
        }
        jcr {
            ...NodeData
        }
    }
    ${EditFormSectionsFragment}
    ${NodeDataFragment.nodeData.gql}
`;
