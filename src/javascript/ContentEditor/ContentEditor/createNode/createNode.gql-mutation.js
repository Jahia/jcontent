import gql from 'graphql-tag';
import {PredefinedFragments} from '@jahia/data-helper';

export const CreateNode = gql`
    mutation createNode(
        $uuid: String!,
        $name: String!,
        $primaryNodeType: String!,
        $mixins: [String],
        $wipInfo: InputwipInfo!,
        $properties: [InputJCRProperty],
        $children: [InputJCRNode],
        $reorder: Boolean!
        $orderBefore: String
    ) {
        jcr {
            addNode(
                parentPathOrId: $uuid,
                name: $name,
                primaryNodeType: $primaryNodeType,
                mixins: $mixins,
                properties: $properties,
                children: $children,
                useAvailableNodeName: true
            ) {
                uuid
                node {
                    ...NodeCacheRequiredFields
                }
                createWipInfo(wipInfo:$wipInfo)
            }
            mutateNode(pathOrId:$uuid) @include(if: $reorder) {
                reorderChildren(names:[$name, $orderBefore])
            }
            modifiedNodes {
                ...NodeCacheRequiredFields
                path
                uuid
            }
        }
    }
    ${PredefinedFragments.nodeCacheRequiredFields.gql}
`;
