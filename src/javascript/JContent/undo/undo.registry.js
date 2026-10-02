import {registry} from '@jahia/ui-extender';

/**
 * Who knows how to take back an operation of a given kind.
 *
 * The registry rather than a map in this file, for one reason: the operations that most want an undo
 * are not all in jContent. The content type browser and the multisite manager each grew their own
 * copy of this mechanism, and a registry lets them hand their inverse over instead of carrying a
 * second implementation of the whole thing.
 *
 * A handler is `{invert}`: `invert(snapshot, {client})` performs the reverse and resolves to
 * `{failures}`, one entry per thing that could not be put back. It resolves rather than throws on a
 * partial failure, because partly undone is the normal outcome when somebody has taken a name or a
 * permission has changed, and the reader needs to be told which part rather than handed an
 * exception.
 *
 * What the notification says is not the handler's business. The call site that ran the operation
 * already knows what it did and in whose words to say it, and it is the one holding the translation
 * for the content it just touched.
 */

const UNDO_HANDLER = 'undoHandler';

/**
 * Registers the handler that can take back operations of one kind.
 *
 * @param {string} kind matches the `kind` of the snapshots it can invert
 * @param {{invert: Function}} handler how to invert one
 * @returns {object} the registry entry
 */
export const registerUndoHandler = (kind, handler) => registry.addOrReplace(UNDO_HANDLER, kind, handler);

/**
 * The handler for a kind, or undefined where nothing has registered one.
 *
 * @param {string} kind the snapshot's kind
 * @returns {{invert: Function}|undefined} the handler
 */
export const getUndoHandler = kind => registry.get(UNDO_HANDLER, kind);
