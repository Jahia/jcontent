import {useCallback} from 'react';
import {useApolloClient, useMutation} from '@apollo/client';
import {useTranslation} from 'react-i18next';
import {useNotifications} from '@jahia/react-material';
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
    const {t} = useTranslation('jcontent');
    const notificationContext = useNotifications();
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
        try {
            await markForDeletion({variables: {path}});
        } catch (error) {
            console.error('Error while marking visibility condition for deletion', error);
            notificationContext.notify(t('jcontent:label.contentEditor.edit.action.save.error'), ['closeButton', 'closeAfter5s']);
            throw error;
        }

        await refreshAll();
    }, [markForDeletion, refreshAll, notificationContext, t]);

    const unmarkConditionForDeletion = useCallback(async path => {
        try {
            await unmarkForDeletion({variables: {path}});
        } catch (error) {
            console.error('Error while undeleting visibility condition', error);
            notificationContext.notify(t('jcontent:label.contentEditor.edit.action.save.error'), ['closeButton', 'closeAfter5s']);
            throw error;
        }

        await refreshAll();
    }, [unmarkForDeletion, refreshAll, notificationContext, t]);

    const publishConditionDeletion = useCallback(uuid => {
        // Delegates to the standard publication workflow (same as the publishDeletion action). The
        // deletion is committed once the workflow completes.
        window.authoringApi.openPublicationWorkflow([uuid], false, false);
    }, []);

    return {markConditionForDeletion, unmarkConditionForDeletion, publishConditionDeletion};
};
