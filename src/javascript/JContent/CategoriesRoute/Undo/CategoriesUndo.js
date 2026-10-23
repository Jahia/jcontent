import {parse} from 'graphql';

/**
 * Taking back the last move in the category tree.
 *
 * A move is its own inverse, so unlike a bulk property edit there is nothing to read back from the
 * repository first: where each category sat before the drop is all the snapshot needs, and the way
 * back is simply another move.
 *
 * Nodes are held by uuid rather than by path, because the path is exactly what the move changed -
 * and by the time the reader presses Undo the category may already have been renamed on conflict.
 * The parent is held by path, since that node did not move.
 */

/**
 * What a drop just did, and everything the undo needs to reverse it.
 *
 * `label` names the target, because "Undo" beside a tree that has just changed says too little -
 * the reader wants to know which move they are about to take back.
 */
export const buildMoveSnapshot = ({nodes, target}) => ({
    kind: 'move',
    label: target?.displayName || target?.name,
    entries: (nodes || [])
        .filter(node => node.uuid && node.path)
        .map(node => ({
            uuid: node.uuid,
            name: node.name,
            // What the reader saw in the row. Absent on a multiple selection, where the message
            // counts the categories instead of naming one.
            displayName: node.displayName || node.name,
            fromParent: node.path.substring(0, node.path.lastIndexOf('/'))
        })),
    count: (nodes || []).length
});

/**
 * The mutation that puts every category back, in one document.
 *
 * One aliased `mutateNode` per category rather than a single `mutateNodes`, because each one is
 * going back to its **own** previous parent - dragging a multiple selection out of several
 * branches is the case a single destination could not undo.
 *
 * `renameOnConflict` mirrors the move that got us here: if something has since taken the old name,
 * the category comes back beside it rather than the whole undo failing.
 */
export const buildUndoMoveDocument = snapshot => {
    const declarations = [];
    const selections = snapshot.entries.map((entry, index) => {
        declarations.push(`$u${index}: String!`, `$p${index}: String!`);
        return `n${index}: mutateNode(pathOrId: $u${index}) {
                move(parentPathOrId: $p${index}, renameOnConflict: true)
                node { uuid path }
            }`;
    });

    return parse(`
        mutation undoCategoryMove(${declarations.join(', ')}) {
            jcr(workspace: EDIT) {
                ${selections.join('\n                ')}
            }
        }
    `);
};

/** The variables that go with it, named to match. */
export const buildUndoMoveVariables = snapshot => {
    const variables = {};
    snapshot.entries.forEach((entry, index) => {
        variables[`u${index}`] = entry.uuid;
        variables[`p${index}`] = entry.fromParent;
    });
    return variables;
};

/** The parents to reopen once the categories are back, so the reader sees where they landed. */
export const restoredParents = snapshot => [...new Set((snapshot?.entries || []).map(entry => entry.fromParent))];
