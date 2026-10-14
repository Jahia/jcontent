import {useCallback, useState} from 'react';
import {useApolloClient} from '@apollo/client';
import {clearUndo, peekUndo} from './undo.store';
import {getUndoHandler} from './undo.registry';

/**
 * Running the undo that is currently on offer.
 *
 * The snapshot is read at the moment the reader presses the button rather than taken from a render,
 * so that a snapshot replaced while the notification was on screen cannot be undone by a button
 * drawn for the one before it.
 *
 * The snapshot is spent either way. An undo that failed outright is not worth offering a second
 * time: whatever stopped it - a name taken, a permission lost, a node gone - will stop it again, and
 * leaving the offer on screen invites the reader to keep pressing a button that cannot work.
 *
 * @returns {{runUndo: Function, isRunning: boolean}} the runner and whether it is in flight
 */
export const useUndoRunner = () => {
    const client = useApolloClient();
    const [isRunning, setIsRunning] = useState(false);

    const runUndo = useCallback(async () => {
        const snapshot = peekUndo();

        if (!snapshot) {
            return {failures: []};
        }

        const handler = getUndoHandler(snapshot.kind);

        if (!handler?.invert) {
            clearUndo();
            return {failures: [{kind: snapshot.kind, reason: 'noHandler'}]};
        }

        setIsRunning(true);

        try {
            const result = await handler.invert(snapshot, {client});
            return result || {failures: []};
        } catch (error) {
            // A handler that throws rather than reporting its failures still should not take the
            // notification down with it.
            return {failures: [{kind: snapshot.kind, reason: 'error', error}]};
        } finally {
            clearUndo();
            setIsRunning(false);
        }
    }, [client]);

    return {runUndo, isRunning};
};
