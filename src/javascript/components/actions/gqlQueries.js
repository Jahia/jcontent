import gql from "graphql-tag";
import {PredefinedFragments} from "@jahia/apollo-dx";

const CheckRequirementsQuery = gql`query checkRequirementsQuery($path:String!, $permission:String!, $isNodeType:  InputNodeTypesInput!, $isNotNodeType:  InputNodeTypesInput!) {
    jcr {
        nodeByPath(path:$path) {
            ...NodeCacheRequiredFields
            perm: hasPermission(permissionName:$permission)
            showOnType: isNodeType(type:$isNodeType)
            hideOnType: isNodeType(type:$isNotNodeType)
        }
    }
  }
   ${PredefinedFragments.nodeCacheRequiredFields.gql}`;

export { CheckRequirementsQuery }