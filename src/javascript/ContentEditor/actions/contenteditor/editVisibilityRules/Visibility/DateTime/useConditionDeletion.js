import {useCallback} from 'react';
import {useApolloClient, useMutation} from '@apollo/client';
import {MarkForDeletionMutation, UndeleteMutation} from '~/JContent/actions/deleteActions/Delete/delete.gql-mutation';
import {triggerRefetchAll} from '~/JContent/JContent.refetches';

/**
 * Hook handling the deletion lifecycle of a single visibility condition, reusing the standard
 * jContent deletion mechanism:
 *  - mark for deletion   -> jcr.markNodeForDeletion (soft delete, reversible, shown as "marked for deletion")
 *  - undelete            -> jcr.unmarkNodeForDeletion
 *  - publish the deletion -> opens the standard publication workflow on the condition node, which is
 *    what actually removes it (the deletion is committed upon publication).
 *
 * @param {object} params
 * @param {Function} params.refresh refetch callback for the visibility query
 */
export const useConditionDeletion = ({refresh}) => {
    const client = useApolloClient();
    const [markForDeletion] = useMutation(MarkForDeletionMutation);
    const [unmarkForDeletion] = useMutation(UndeleteMutation);

    const refreshAll = useCallback(async () => {
        // Hard refresh so the publication menu in the jContent header and the rule statuses stay in sync.
        client.reFetchObservableQueries();
        triggerRefetchAll();
        if (refresh) {
            await refresh();
        }
    }, [client, refresh]);

    const markConditionForDeletion = useCallback(async path => {
        await markForDeletion({variables: {path}});
        await refreshAll();
    }, [markForDeletion, refreshAll]);

    const unmarkConditionForDeletion = useCallback(async path => {
        await unmarkForDeletion({variables: {path}});
        await refreshAll();
    }, [unmarkForDeletion, refreshAll]);

    const publishConditionDeletion = useCallback(uuid => {
        // Delegates to the standard publication workflow (same as the publishDeletion action). The
        // deletion is committed once the workflow completes.
        window.authoringApi.openPublicationWorkflow([uuid], false, false);
    }, []);

    return {markConditionForDeletion, unmarkConditionForDeletion, publishConditionDeletion};
};
