import {UndeleteMutation} from './delete.gql-mutation';
import {registerUndoHandler} from '~/JContent/undo';

/**
 * Taking back a mark for deletion.
 *
 * The cleanest inverse jContent has: marking is a mixin on the node, and `unmarkNodeForDeletion`
 * takes it off again. Nothing is read back first, because nothing was replaced - the content is
 * where it was, and only the mark has to go.
 *
 * Only the paths the dialog acted on are recorded, not the descendants that were marked along with
 * them. Marking a node marks its subtree and unmarking the same node unmarks the subtree, so the
 * roots are the whole snapshot; recording the descendants as well would unmark, one by one, nodes
 * that somebody had marked deliberately before this operation ever ran.
 *
 * Permanent deletion gets no undo and should not. There is nothing left to put the content back
 * from, and an offer that cannot be honoured is worse than no offer.
 */

export const MARK_FOR_DELETION_UNDO = 'markForDeletion';

/**
 * What the dialog just marked.
 *
 * @param {object} options the operation
 * @param {Array<string>} options.paths the nodes the dialog acted on
 * @param {string} [options.displayName] what the reader saw named, where it was a single node
 * @returns {object} the snapshot
 */
export const buildMarkForDeletionSnapshot = ({paths, displayName}) => ({
    kind: MARK_FOR_DELETION_UNDO,
    label: displayName,
    count: (paths || []).length,
    paths: paths || []
});

/**
 * Takes the mark off again, reporting whichever nodes would not have it taken off.
 *
 * The calls go out together rather than one after another: they touch unrelated subtrees, none
 * depends on the one before it, and a reader waiting on an undo should not wait through a queue.
 *
 * @param {object} snapshot what was marked
 * @param {object} context the context
 * @param {object} context.client the Apollo client
 * @returns {Promise<{failures: Array}>} what could not be unmarked
 */
export const invertMarkForDeletion = async (snapshot, {client}) => {
    const paths = snapshot?.paths || [];

    const results = await Promise.allSettled(
        paths.map(path => client.mutate({mutation: UndeleteMutation, variables: {path}}))
    );

    const failures = results
        .map((result, index) => (result.status === 'rejected' ? {path: paths[index], error: result.reason} : null))
        .filter(Boolean);

    return {failures};
};

/** Makes the undo available to whoever presses the button. */
export const registerDeleteUndoHandlers = () => {
    registerUndoHandler(MARK_FOR_DELETION_UNDO, {invert: invertMarkForDeletion});
};
