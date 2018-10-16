export default class Node {
    constructor(path, uuid, name, displayName) {
        this.path = path;
        this.uuid = uuid;
        this.name = name;
        this.displayName = displayName;
    }

    toString() {
        return `
            ${this.path}, 
            ${this.uuid},
            ${this.name},
            ${this.displayName}
        `;
    }
}