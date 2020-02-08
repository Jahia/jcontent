import copyPasteQueries from './copyPaste.gql-queries';
import copyPasteConstants from './copyPaste.constants';
import {copypasteCut, copypasteCopy} from './copyPaste.redux-actions';

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

const initClipboardWatcher = (store, client) => {
    setInterval(() => {
        let previousValue = currentValue;
        currentValue = localStorage.getItem('jahia-clipboard');

        if (previousValue !== currentValue) {
            let cb = JSON.parse(currentValue);
            if (!cb) {
                return;
            }

            client.query({
                query: copyPasteQueries.getClipboardInfo,
                variables: {uuids: cb.nodes.map(n => n.uuid)}
            }).then(({data}) => {
                const nodesWithData = data.jcr.nodesById;

                if (cb.type === copyPasteConstants.CUT) {
                    store.dispatch(copypasteCut(nodesWithData));
                } else {
                    store.dispatch(copypasteCopy(nodesWithData));
                }
            });
        }
    }, 1000);
};

const setLocalStorage = (type, nodes, client) => {
    client.query({
        query: copyPasteQueries.getClipboardInfo,
        variables: {uuids: nodes.map(n => n.uuid)}
    }).then(({data}) => {
        const nodesWithData = data.jcr.nodesById;
        let clipboard = {
            nodes: nodesWithData.map(getGWTNode),
            type
        };
        currentValue = JSON.stringify(clipboard);
        localStorage.setItem('jahia-clipboard', currentValue);
    });
};

export {setLocalStorage, initClipboardWatcher};
