import {gql} from 'graphql-tag';
import {PredefinedFragments} from '@jahia/data-helper';

export const valueTypesQuery = gql`
    query valueTypesQuery($uuids: [String!]!) {
        jcr{
            result: nodesById(uuids: $uuids) {
                ...NodeCacheRequiredFields
                primaryNodeType {
                    name
                    supertypes{name}
                }
                mixinTypes {name}
            }
        }
    }
    ${PredefinedFragments.nodeCacheRequiredFields.gql}
`;

export const valueTypesByPathQuery = gql`
    query valueTypesByPathQuery($paths: [String!]!) {
        jcr{
            result: nodesByPath(paths: $paths) {
                ...NodeCacheRequiredFields
                primaryNodeType {
                    name
                    supertypes{name}
                }
                mixinTypes {name}
            }
        }
    }
    ${PredefinedFragments.nodeCacheRequiredFields.gql}
`;
