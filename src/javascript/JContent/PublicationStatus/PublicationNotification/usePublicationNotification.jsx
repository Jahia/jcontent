import {useSubscription} from '@apollo/client';
import {SubscribeToPublicationData} from './PublicationNotification.gql-subscription';
import {useNotifications} from '@jahia/react-material';

export const usePublicationNotification = () => {
    const notificationContext = useNotifications();
    const {data, loading, error} = useSubscription(SubscribeToPublicationData);

    if (error) {
        console.error(error);
    }

    if (!loading && !error && data?.backgroundJobSubscription?.publicationJob) {
        const language = data.backgroundJobSubscription.publicationJob.language;
        const state = data.backgroundJobSubscription.publicationJob.jobState;

        if (state === 'STARTED') {
            notificationContext.notify(`Publishing in ${language}`);
        } else if (state === 'FINISHED') {
            notificationContext.notify(`Publication completed`);
        }
    }
}
