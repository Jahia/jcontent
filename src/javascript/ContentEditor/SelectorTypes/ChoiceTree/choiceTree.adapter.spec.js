import {choiceTreeAdapter} from './choiceTree.adapter';

// The adapter now converts the flat `treeEntries` produced by `useTreeEntries`
// (path-keyed, one level at a time) into moonstone TreeView data. Each entry
// mirrors the shape returned by the hook.
const entry = ({path, uuid, name, displayName, depth, hasChildren = false, openable = hasChildren, selectable = true, open = false}) => ({
    path,
    depth,
    open,
    openable,
    selectable,
    hasChildren,
    node: {uuid, name, displayName, primaryNodeType: {name: 'jnt:category'}}
});

describe('choice tree adapter', () => {
    it('should return an empty array when there are no entries', () => {
        expect(choiceTreeAdapter({treeEntries: []})).toEqual([]);
    });

    it('should nest entries by path and expose uuid as value', () => {
        const treeEntries = [
            entry({path: '/root/a', uuid: 'A', name: 'a', displayName: 'aa', depth: 1, hasChildren: true}),
            entry({path: '/root/a/b', uuid: 'B', name: 'b', displayName: 'bb', depth: 2}),
            entry({path: '/root/leaf', uuid: 'leaf', name: 'leaf', displayName: 'leaf', depth: 1})
        ];

        const tree = choiceTreeAdapter({treeEntries, openPaths: ['/root/a'], loading: false});

        expect(tree).toHaveLength(2);
        const [a, leaf] = tree;

        expect(a).toMatchObject({id: '/root/a', value: 'A', label: 'aa', hasChildren: true, isClosable: true, isSelectable: true});
        expect(a.children).toHaveLength(1);
        expect(a.children[0]).toMatchObject({id: '/root/a/b', value: 'B', label: 'bb', hasChildren: false});

        expect(leaf).toMatchObject({id: '/root/leaf', value: 'leaf', hasChildren: false, isClosable: false});
        expect(leaf.children).toHaveLength(0);
    });

    it('should flag a branch as loading while its open children are being fetched', () => {
        const treeEntries = [
            entry({path: '/root/a', uuid: 'A', name: 'a', displayName: 'aa', depth: 1, hasChildren: true, open: false})
        ];

        const tree = choiceTreeAdapter({treeEntries, openPaths: ['/root/a'], loading: true});

        expect(tree[0].isLoading).toBe(true);
    });
});
