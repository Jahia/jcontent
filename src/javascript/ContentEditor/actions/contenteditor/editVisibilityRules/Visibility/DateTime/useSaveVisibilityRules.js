import {useCallback} from 'react';
import {useApolloClient, useMutation} from '@apollo/client';
import {useTranslation} from 'react-i18next';
import {useNotifications} from '@jahia/react-material';
import {UpdateVisibilityRulesMutation} from '../Visibility.gql-queries';
import {triggerRefetchAll} from '~/JContent/JContent.refetches';

/**
 * Hook returning a function that performs a real backend save of visibility conditions
 * (add / update / remove a rule, or change the matching mode) and then refreshes the
 * local visibility query as well as the global queries so publication menus and status
 * are kept in sync.
 *
 * @param {object} params
 * @param {string} params.uuid uuid of the node holding the visibility conditions
 * @param {string} params.lang current language
 * @param {Function} params.refresh refetch callback for the visibility query
 */
export const useSaveVisibilityRules = ({uuid, lang, refresh}) => {
    const client = useApolloClient();
    const {t} = useTranslation('jcontent');
    const notificationContext = useNotifications();
    const [saveRules] = useMutation(UpdateVisibilityRulesMutation);

    return useCallback(async ({
        newConditions = [],
        updatedConditions = [],
        removedConditions = [],
        isMatchingAllConditions = false
    }) => {
        try {
            await saveRules({
                variables: {
                    uuid,
                    lang,
                    newConditions,
                    updatedConditions,
                    removedConditions,
                    isMatchingAllConditions
                }
            });
        } catch (error) {
            console.error('Error while saving visibility conditions', error);
            notificationContext.notify(t('jcontent:label.contentEditor.edit.action.save.error'), ['closeButton', 'closeAfter5s']);
            // Re-throw so callers don't run their success handlers (e.g. closing the edit panel).
            throw error;
        }

        // Hard refresh so the publication menu in the jContent header and the rule statuses
        // reflect the change. Note this reloads ALL observable queries (invasive but matches
        // the previous dialog-level save behaviour).
        client.reFetchObservableQueries();
        triggerRefetchAll();
        if (refresh) {
            await refresh();
        }
    }, [saveRules, uuid, lang, client, refresh, notificationContext, t]);
};
