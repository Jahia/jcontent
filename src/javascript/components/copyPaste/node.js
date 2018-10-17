export default class Node {
    constructor(path, uuid, name, displayName, primaryNodeType) {
        this.path = path;
        this.uuid = uuid;
        this.name = name;
        this.displayName = displayName;
        this.primaryNodeType = primaryNodeType;
    }

    toString() {
        return `
            ${this.path}, 
            ${this.uuid},
            ${this.name},
            ${this.displayName}
            ${this.primaryNodeType}
        `;
    }
}