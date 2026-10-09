import gql from 'graphql-tag';

/**
 * Fragment for useNodeChecks (applyFragment) that fetches whether the user has the component permission of the
 * node's type, the same permission required to create content of this type.
 */
export const componentPermissionFragment = {
    applyFor: 'node',
    gql: gql`fragment ComponentPermission on JCRNode {
        hasComponentPermission
    }`
};

/**
 * Returns true if the user has the component permission of every checked node's type.
 *
 * @param {object} res - The result of useNodeChecks queried with componentPermissionFragment
 * @returns {boolean}
 */
export const hasComponentPermission = res => {
    const nodes = res.node ? [res.node] : Object.values(res.nodes || {});
    return nodes.every(node => node?.hasComponentPermission);
};
