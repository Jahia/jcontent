import {displayIcon, findInTree, getParentPath} from '~/JContent/ContentTree/ContentTree.utils';

// Build moonstone TreeView data from the flat `treeEntries` produced by the shared
// `useTreeEntries` hook. This mirrors JContent's ContentTree `convertPathsToTree`,
// trimmed down to what a form-field picker needs (no publication status, DnD,
// virtualization or contextual menu) and keyed so selection maps back to uuids.
//
// Nodes are keyed on `id: path` (that is what `useTreeEntries`, `openPaths` and
// TreeView expect), while `value: uuid` carries the identifier actually stored in
// the field value.
export const choiceTreeAdapter = ({treeEntries, openPaths = [], loading}) => {
    const tree = [];

    treeEntries.forEach(treeEntry => {
        const {node} = treeEntry;
        const parentPath = getParentPath(treeEntry.path);

        const element = {
            id: treeEntry.path,
            value: node.uuid,
            label: node.displayName,
            hasChildren: treeEntry.hasChildren && treeEntry.openable,
            isClosable: treeEntry.depth > 0 && treeEntry.hasChildren,
            isSelectable: treeEntry.selectable,
            // Show a spinner on a branch whose children are still being fetched.
            isLoading: loading && !treeEntry.open && treeEntry.openable && openPaths.includes(treeEntry.path),
            iconStart: displayIcon(node),
            children: [],
            treeItemProps: {
                'data-sel-role': node.name,
                node
            }
        };

        const parent = findInTree(tree, parentPath);
        if (parent !== undefined && !findInTree(parent.children, element.id)) {
            parent.children.push(element);
        } else if (!findInTree(tree, element.id)) {
            tree.push(element);
        }
    });

    return tree;
};
