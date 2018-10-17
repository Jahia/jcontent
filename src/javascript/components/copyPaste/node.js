export default class Node {
    constructor(path, uuid, name, displayName, primaryNodeType, mutationToUse) {
        this.path = path;
        this.uuid = uuid;
        this.name = name;
        this.displayName = displayName;
        this.primaryNodeType = primaryNodeType;
        this.mutationToUse = mutationToUse;
    }

    toString() {
        return `
            ${this.path}, 
            ${this.uuid},
            ${this.name},
            ${this.displayName}
            ${this.primaryNodeType}
            ${this.mutationToUse}
        `;
    }
}

Node.PASTE_MODES = {};

Node.PASTE_MODES = {
    "COPY" : "COPY",
    "MOVE" : "MOVE"
};
