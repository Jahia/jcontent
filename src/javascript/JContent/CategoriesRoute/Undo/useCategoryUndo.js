import {useSyncExternalStore} from 'react';

/**
 * The one move that can still be taken back.
 *
 * A module-level value rather than React state because of who needs to reach it: the snapshot is
 * recorded deep inside the drop handler of a table row, and the bar that offers the undo is drawn
 * in the header toolbar. Threading a setter between them would put a prop on every component in
 * between, none of which has anything else to do with undo.
 *
 * One snapshot, never a stack. Recording a second replaces the first: each step back is written
 * from where the categories sat just before that step, and a second move invalidates the first
 * snapshot's assumptions about where things are.
 */
let snapshot = null;
const listeners = new Set();

const emit = () => listeners.forEach(listener => listener());

const subscribe = listener => {
    listeners.add(listener);
    return () => listeners.delete(listener);
};

const read = () => snapshot;

/** Records where the categories just came from, superseding anything recorded before it. */
export const recordCategoryUndo = next => {
    snapshot = next;
    emit();
};

/** Forgets it - after the undo has run, and when the reader dismisses the bar. */
export const clearCategoryUndo = () => {
    if (snapshot !== null) {
        snapshot = null;
        emit();
    }
};

/**
 * The snapshot, for whoever draws the bar. useSyncExternalStore rather than an effect and a piece
 * of state: it keeps the value consistent through a concurrent render instead of tearing between
 * subscribers reading at different moments.
 */
export const useCategoryUndo = () => useSyncExternalStore(subscribe, read, read);

export default useCategoryUndo;
