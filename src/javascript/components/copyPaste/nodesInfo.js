let nodesInfo = [];

const NodesInfo = {
    getNodes : () => {
        return nodesInfo.slice();
    },
    addNode : (node) => {
        nodesInfo.push(node);
    },
    addNodes : (nodes) => {
        nodesInfo = nodesInfo.concat(nodes);
    },
    removeNode : (index) => {
        nodesInfo.splice(index, 1);
    },
    removeAll : () => {
        nodesInfo = [];
    }
};

export default NodesInfo;