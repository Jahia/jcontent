import {useCallback, useEffect, useRef, useState} from 'react';

/**
 * Keeps track of which item in a reorderable list the user has just moved, so that the list can
 * hand it the focus once it has been redrawn in its new place.
 *
 * Reordering redraws the list in a new order, and React moves the corresponding DOM nodes; moving
 * a node takes the focus off it. Without this the focus falls back to the document and the editor
 * has nothing telling them where the item they just moved has landed.
 *
 * A move is answered with a number rather than a boolean, because moving the same item twice in a
 * row has to focus it twice: the first move already blurred it, so a value that did not change
 * between the two would leave the second move unanswered.
 *
 * @returns {{requestFocus: Function, focusIdFor: Function}} requestFocus records the key of the
 * item that moved; focusIdFor answers, for an item key, the id to hand to useFocusOnMove
 */
export function useMovedItemFocus() {
    const moveCount = useRef(0);
    const [moved, setMoved] = useState(null);

    const requestFocus = useCallback(key => {
        moveCount.current += 1;
        setMoved({key, id: moveCount.current});
    }, []);

    const focusIdFor = useCallback(key => (moved?.key === key ? moved.id : null), [moved]);

    return {requestFocus, focusIdFor};
}

/**
 * Focuses an element every time it is named as the item that has just been moved.
 *
 * @param {object} ref reference to the element to focus, the item as a whole rather than the
 * control that moved it, which may well have become disabled by arriving where it did
 * @param {number|null} focusId id from focusIdFor, null while this item is not the one that moved
 */
export function useFocusOnMove(ref, focusId) {
    useEffect(() => {
        if (focusId !== null && focusId !== undefined) {
            // Scrolling into view is wanted here: moving an item to the first or last position can
            // send it well outside what is on screen.
            ref.current?.focus();
        }
        // The ref is deliberately not a dependency: it is the same element across a reorder, only
        // its position changes, and re-running on identity changes would focus it unasked.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [focusId]);
}
