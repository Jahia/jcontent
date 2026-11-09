import React from 'react';
import {clearUndo} from './undo.store';
import {UndoAction} from './UndoAction';

/**
 * How long the offer stands.
 *
 * Longer than the five seconds jContent gives a plain confirmation, because this one has to be read
 * and then acted on, and short enough that it is still obviously about the thing that just happened.
 */
const DEFAULT_DURATION = 8000;

/**
 * Says what just happened, and offers to take it back.
 *
 * The caller records the snapshot first, through `recordUndo`; this only draws the offer. Keeping
 * the two separate matters for operations that record a snapshot without wanting a notification -
 * a drop, say, where the content visibly moved and a message would only repeat what the reader just
 * watched happen.
 *
 * @param {object} notificationContext from `useNotifications`
 * @param {string} message what happened, in the reader's own words
 * @param {object} [options] options
 * @param {number} [options.duration] how long the offer stands, in milliseconds
 */
export const notifyWithUndo = (notificationContext, message, {duration = DEFAULT_DURATION} = {}) => {
    notificationContext.notify(message, [], {
        autoHideDuration: duration,
        action: [<UndoAction key="undo"/>],
        onClose: (event, reason) => {
            // A click somewhere else on the screen is not a decision about the undo. MUI closes a
            // snackbar on clickaway by default, which for a plain confirmation is harmless and for
            // an offer to take something back means losing it to a stray click on the content the
            // reader is checking before they decide.
            if (reason === 'clickaway') {
                return;
            }

            // The offer lives exactly as long as the notification. Leaving the snapshot behind once
            // the message is gone would mean the next notification silently inherited an undo
            // belonging to an operation the reader can no longer see named.
            clearUndo();
            notificationContext.closeNotification();
        }
    });
};
