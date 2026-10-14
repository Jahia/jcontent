import {useSyncExternalStore} from 'react';

/**
 * The one operation that can still be taken back.
 *
 * A module-level value rather than React state, because of who needs to reach it. The code that
 * records a snapshot is wherever the operation runs - a dialog, a drop handler, a toolbar - and the
 * code that offers the undo is the notification snackbar, mounted at the root of the application.
 * There is no component that contains both, so threading a setter between them would mean putting a
 * prop on every component in between, none of which has anything else to do with undo.
 *
 * One snapshot, never a stack. Recording a second replaces the first, and that is the whole model:
 * each step back is written from what was read just before that step, and a second operation
 * invalidates the first snapshot's assumptions about what is on disk. Nothing here notices if
 * somebody else has edited the same content in between either. One step, taken straight away, is a
 * promise the repository can keep; a stack is not.
 */

let snapshot = null;
const listeners = new Set();

const emit = () => listeners.forEach(listener => listener());

/**
 * Subscribes to changes of the recorded snapshot.
 *
 * @param {Function} listener called whenever the snapshot is recorded, replaced or cleared
 * @returns {Function} unsubscribe
 */
export const subscribeToUndo = listener => {
    listeners.add(listener);
    return () => listeners.delete(listener);
};

/** The snapshot as it stands, for code outside a render. */
export const peekUndo = () => snapshot;

/**
 * Records what an operation just replaced, superseding anything recorded before it.
 *
 * @param {object} next the snapshot, whose `kind` names the registered handler that can invert it
 */
export const recordUndo = next => {
    snapshot = next;
    emit();
};

/**
 * Forgets it - after the undo has run, and when the reader dismisses the offer.
 *
 * Guarded so that clearing an already empty store does not wake every subscriber for nothing.
 */
export const clearUndo = () => {
    if (snapshot !== null) {
        snapshot = null;
        emit();
    }
};

/**
 * The snapshot, for whoever draws the offer.
 *
 * `useSyncExternalStore` rather than an effect and a piece of state: it is what React provides for
 * exactly this, and it keeps the value consistent through a concurrent render instead of tearing
 * between two subscribers reading at different moments.
 *
 * @returns {object|null} the snapshot that can still be taken back, or null
 */
export const useUndo = () => useSyncExternalStore(subscribeToUndo, peekUndo, peekUndo);
