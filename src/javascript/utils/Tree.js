const filterTree = (tree, predicate) => tree
    .filter(predicate)
    .map(item => ({...item, children: filterTree(item.children, predicate)}));

const mapTree = (tree, mapFunction) => tree
    .map(item => ({...mapFunction(item), children: mapTree(item.children, mapFunction)}));

export class Tree {
    constructor(data) {
        this.data = data;
    }

    filter(predicate) {
        return new Tree(filterTree(this.data, predicate));
    }

    map(mapFunction) {
        return new Tree(mapTree(this.data, mapFunction));
    }

    data() {
        return this.data;
    }
}

