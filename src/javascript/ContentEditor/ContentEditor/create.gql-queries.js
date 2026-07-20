import gql from 'graphql-tag';
import {PredefinedFragments} from '@jahia/data-helper';
import {ContentEditorFragment} from './fragments';

export const CreateFormQuery = gql`
    query createForm($uilang:String!, $language:String!, $uuid:String!, $primaryNodeType:String!) {
        forms {
            createForm(primaryNodeType: $primaryNodeType, uiLocale: $uilang, locale: $language, uuidOrPath: $uuid) {
                ...ContentEditorFragment
            }
        }
        jcr {
            result:nodeById(uuid: $uuid) {
                ...NodeCacheRequiredFields
                newName: findAvailableNodeName(nodeType: $primaryNodeType, language: $language)
                site {
                    ...NodeCacheRequiredFields
                    name
                }
                lockedAndCannotBeEdited
                # Parent item-count limit info, used to enforce j:numberOfItems / jmix:listSizeLimit
                # while the "Create another" checkbox is checked (refetched on each create-another save).
                childrenCount: children(typesFilter: {types: ["nt:base"], multi: ANY}) {
                    pageInfo {
                        totalCount
                    }
                }
                isListSizeLimit: isNodeType(type: {multi: ANY, types: ["jmix:listSizeLimit"]})
                limitProperty: property(name: "limit") {
                    value
                }
                displayableNode {
                    ...NodeCacheRequiredFields
                    path
                    isFolder:isNodeType(type: {multi: ANY, types: ["jnt:contentFolder", "jnt:folder"]})
                }
                displayName(language: $language)
                mixinTypes {
                    name
                }
                parent {
                    ...NodeCacheRequiredFields
                    displayName(language: $language)
                    path
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
                    }
                    hasOrderableChildNodes
                }
                defaultWipInfo {
                    status
                    languages
                }
            }
            nodeTypeByName(name: $primaryNodeType) {
                name
                displayName(language: $uilang)
                moveSystemNameToTop: isNodeType(type: {multi: ANY, types: [
                    "jnt:page",
                    "jnt:contentFolder",
                    "jnt:folder",
                    "jnt:file",
                    "jnt:category",
                    "jmix:mainResource"
                ]})
                isSystemNameReadOnlyMixin: isNodeType(type: {multi: ANY, types: ["jmix:systemNameReadonly"]})
            }
        }
    }
    ${ContentEditorFragment}
    ${PredefinedFragments.nodeCacheRequiredFields.gql}
`;
