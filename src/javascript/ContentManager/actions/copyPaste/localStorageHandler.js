import copyPasteQueries from './copyPaste.gql-queries';

const localStorage = window.localStorage;

const getGWTNode = n => {
    let node = {
        name: n.name,
        path: n.path,
        uuid: n.uuid,
        nodetype: n.primaryNodeType.name,
        displayName: n.displayName,
        nodeTypes: [n.primaryNodeType.name, ...n.mixinTypes.map(t => t.name)],
        inheritedNodeTypes: [...n.primaryNodeType.supertypes.map(t => t.name), ...n.mixinTypes.flatMap(s => s.supertypes.map(t => t.name))],
        referenceNode: null
    };

    if (n.referenceNode) {
        node.referenceNode = getGWTNode(n.referenceNode);
    }

    return node;
};

let currentValue = '';

setInterval(() => {
    let previousValue = currentValue;
    currentValue = localStorage.getItem('jahia-clipboard');

    if (previousValue !== currentValue) {
        console.log('New clipboard', currentValue);
    }
}, 1000);

const setLocalStorage = (type, nodes, client) => {
    client.query({
        query: copyPasteQueries.getClipboardInfo,
        variables: {uuids: nodes.map(n => n.uuid)}
    }).then(({data}) => {
        const nodesWithData = data.jcr.nodesById;
        let clipboard = {
            type,
            nodes: nodesWithData.map(getGWTNode)
        };

        localStorage.setItem('jahia-clipboard', JSON.stringify(clipboard));
    });
};

export {setLocalStorage};
