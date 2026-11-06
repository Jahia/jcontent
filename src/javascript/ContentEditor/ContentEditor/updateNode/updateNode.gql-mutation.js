import gql from 'graphql-tag';
import {PredefinedFragments} from '@jahia/data-helper';

export const SavePropertiesMutation = gql`
    mutation saveNodeProperties(
        $uuid:String!,
        $propertiesToSave: [InputJCRProperty],
        $propertiesToDelete: [InputJCRDeletedProperty],
        $mixinsToAdd: [String]!,
        $mixinsToDelete: [String]!,
        $shouldModifyChildren: Boolean!,
        $childrenOrder: [String]!,
        $shouldReorderMovableChildren: Boolean = false,
        $movableChildrenOrder: [String]! = [],
        $shouldRename: Boolean!,
        $newName: String!,
        $wipInfo: InputwipInfo!,
        $shouldSetWip: Boolean!
    ) {
        jcr {
            mutateNode(pathOrId: $uuid) {
                mutateWipInfo(wipInfo:$wipInfo) @include(if: $shouldSetWip)
            }
            mutateNode(pathOrId: $uuid) {
                rename(name: $newName) @include(if: $shouldRename)
                switchMixins(remove: $mixinsToDelete, add: $mixinsToAdd)
                setPropertiesBatch(properties: $propertiesToSave) {
                    path
                }
                deletePropertiesBatch(properties: $propertiesToDelete)
                reorderChildren(names: $childrenOrder) @include(if: $shouldModifyChildren)
                reorderMovableChildren(names: $movableChildrenOrder) @include(if: $shouldReorderMovableChildren)
                node {
                    ...NodeCacheRequiredFields
                    path
                    displayableNode {
                        ...NodeCacheRequiredFields
                        path
                        isFolder:isNodeType(type: {multi: ANY, types: ["jnt:contentFolder", "jnt:folder"]})
                    }
                }
            }
        }
    }
    ${PredefinedFragments.nodeCacheRequiredFields.gql}
`;
