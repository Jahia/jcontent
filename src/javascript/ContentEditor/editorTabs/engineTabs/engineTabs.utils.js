/**
 * There is no test related to those functions as they are supposed to be deprecated soon.
 * Also as they are mostly related to external call (GWT) more of the logic is outside this code.
 */

export const getNodeTypes = primaryNodeType => {
    let nodeTypes = primaryNodeType.supertypes.map(nodeType => nodeType.name);
    nodeTypes.unshift(primaryNodeType.name);
    return nodeTypes;
};

/**
 * Retrieves the GWT engine tabs available for the given node from the authoring API
 *
 * @param nodeData object contains node data
 * @returns array of GWT engine tabs ({id, title, requiredPermission, ...}), empty if the API is unavailable
 */
export function getGwtEngineTabs(nodeData) {
    if (!window.authoringApi?.getEditTabs) {
        console.warn('DX version is not able to load GWT engine tabs in content editor');
        return [];
    }

    const {path, displayName, uuid, mixinTypes, primaryNodeType} = nodeData;

    return window.authoringApi.getEditTabs(
        path,
        uuid,
        displayName,
        mixinTypes.map(mixinType => mixinType.name),
        getNodeTypes(primaryNodeType),
        primaryNodeType.hasOrderableChildNodes
    );
}

/**
 * This function open the edit engine tabs of to the node
 * that has been specified in the method parameters
 *
 * @param nodeData object contains node data
 * @param engineTabs array contains engine tabs id
 */
export function openEngineTab(nodeData, engineTabs) {
    const {path, displayName, uuid, mixinTypes, primaryNodeType} = nodeData;

    window.authoringApi.editContent(
        path,
        displayName,
        mixinTypes.map(mixinType => mixinType.name),
        getNodeTypes(primaryNodeType),
        uuid,
        false,
        {
            hideWip: true,
            displayedTabs: engineTabs,
            hideHeaders: true,
            skipLock: true
        }
    );
}
