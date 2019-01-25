export default class CopyPasteNode {
    constructor({path, uuid, name, displayName, primaryNodeType, mutationToUse}) {
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

CopyPasteNode.PASTE_MODES = {};

CopyPasteNode.PASTE_MODES = {
    COPY: 'COPY',
    MOVE: 'MOVE'
};
