import gql from "graphql-tag";

const checkPermissionQuery = gql`query checkPermissionQuery($path:String!, $permission:String!) {
    jcr {
        nodeByPath(path:$path) {
            perm: hasPermission(permissionName:$permission)
        }
    }
  }`;

export { checkPermissionQuery }