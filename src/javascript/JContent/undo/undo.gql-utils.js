import {parse} from 'graphql';

/**
 * One mutation document that puts a set of nodes back, each to its own previous state.
 *
 * One aliased `mutateNode` per node rather than a single `mutateNodes`, and that is the point of
 * this helper rather than an incidental detail of it: `mutateNodes` applies **one** value to every
 * node it is given, which is exactly the operation an undo is reversing. Each node is going back to
 * something of its own - its own parent, its own former value - so each needs its own selection.
 *
 * Variables are declared through the `declare` callback rather than by the caller, so that a
 * document can never announce a variable it does not read. GraphQL rejects that outright, and it is
 * easy to walk into: an undo where every node simply had nothing, and so is restored by deleting
 * throughout, has no value to put in the `$type` a value-setting document would have declared.
 */

/**
 * Builds the document.
 *
 * @param {object} options the document to build
 * @param {string} options.name the operation name, which is what shows up in the network tab
 * @param {Array} options.entries one per node, in the shape the caller's `buildEntry` expects
 * @param {string} [options.workspace] the JCR workspace, EDIT unless something says otherwise
 * @param {Function} options.buildEntry `(entry, index, declare) => string` returning the selection
 *        for one node, without its alias; call `declare(name, type)` for each variable it uses and
 *        use the `$name` that comes back
 * @returns {object|null} the parsed document, or null where there was nothing to put back
 */
export const buildAliasedMutation = ({name, entries, workspace = 'EDIT', buildEntry}) => {
    const declarations = [];

    const declare = (variableName, type) => {
        declarations.push(`$${variableName}: ${type}`);
        return `$${variableName}`;
    };

    const selections = (entries || []).map((entry, index) => `n${index}: ${buildEntry(entry, index, declare)}`);

    if (selections.length === 0) {
        return null;
    }

    // An empty pair of parentheses is a syntax error, so a document whose entries declare nothing
    // carries no signature at all.
    const signature = declarations.length > 0 ? `(${declarations.join(', ')})` : '';

    return parse(`
        mutation ${name}${signature} {
            jcr(workspace: ${workspace}) {
                ${selections.join('\n                ')}
            }
        }
    `);
};
