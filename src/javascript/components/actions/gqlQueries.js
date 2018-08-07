import gql from "graphql-tag";
import {PredefinedFragments} from "@jahia/apollo-dx";

const checkPermissionQuery = gql`query checkPermissionQuery($path:String!, $permission:String!) {
    jcr {
        nodeByPath(path:$path) {
            ...NodeCacheRequiredFields
            perm: hasPermission(permissionName:$permission)
        }
    }
  }
   ${PredefinedFragments.nodeCacheRequiredFields.gql}`;

export { checkPermissionQuery }