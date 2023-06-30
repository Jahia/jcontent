import gql from 'graphql-tag';
import {PredefinedFragments} from '@jahia/data-helper';

export const GetAncestorsQueryById = gql`
    query getAncestorsQuery($uuid:String!) {
        jcr {
            node: nodeById(uuid:$uuid) {
                ancestors(fieldFilter: {filters: {fieldName: "primaryNodeType.name", evaluation: AMONG, values:["jnt:page", "jnt:folder", "jnt:contentFolder", "jnt:virtualsite", "jnt:virtualsitesFolder"]}}) {
                    primaryNodeType {
                        name
                    }
                    name
                    path
                    ...NodeCacheRequiredFields
                }
                primaryNodeType {
                    name
                }
                site {
                    name
                    ...NodeCacheRequiredFields
                }
                ...NodeCacheRequiredFields
            }
        }
    }
    ${PredefinedFragments.nodeCacheRequiredFields.gql}
`;

export const GetAncestorsQueryByPath = gql`
    query getAncestorsQuery($path:String!) {
        jcr {
            node: nodeByPath(path:$path) {
                ancestors(fieldFilter: {filters: {fieldName: "primaryNodeType.name", evaluation: AMONG, values:["jnt:page", "jnt:folder", "jnt:contentFolder", "jnt:virtualsite", "jnt:virtualsitesFolder"]}}) {
                    primaryNodeType {
                        name
                    }
                    name
                    path
                    ...NodeCacheRequiredFields
                }
                primaryNodeType {
                    name
                }
                site {
                    name
                    ...NodeCacheRequiredFields
                }
                ...NodeCacheRequiredFields
            }
        }
    }
    ${PredefinedFragments.nodeCacheRequiredFields.gql}
`;
