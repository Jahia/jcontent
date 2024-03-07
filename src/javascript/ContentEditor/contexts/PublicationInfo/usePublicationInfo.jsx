import {useQuery, useSubscription} from '@apollo/client';
import {PublicationInfoQuery} from './PublicationInfo.gql-queries';
import {useState} from 'react';
import {
    SubscribeToPublicationData
} from '~/JContent/PublicationStatus/PublicationNotification/PublicationNotification.gql-subscription';

export const usePublicationInfo = (queryParams, t) => {
    const [polling, setPolling] = useState(false);
    const {loading, error, data, refetch} = useQuery(PublicationInfoQuery, {
        variables: queryParams,
        fetchPolicy: 'network-only',
        pollInterval: polling ? 5000 : 0
    });

    const {loadingSubscription, errorSubscription} = useSubscription(SubscribeToPublicationData, {
        fetchPolicy: 'network-only',
        onData: ({data}) => {
            if (data?.data?.subscribeToPublicationJob?.state === 'UNPUBLISHED' || data?.data?.subscribeToPublicationJob?.state === 'FINISHED') {
                refetch();
            }
        }
    });

    if (error || loading || loadingSubscription || errorSubscription || !data?.jcr) {
        return {
            publicationInfoPolling: polling,
            publicationInfoLoading: loading,
            publicationInfoError: error,
            publicationInfoErrorMessage: error && t('jcontent:label.contentEditor.error.queryingContent', {details: (error.message ? error.message : '')})
        };
    }

    return {
        publicationStatus: data.jcr.nodeById.aggregatedPublicationInfo.publicationStatus,
        lastModified: data.jcr.nodeById.lastModified?.value,
        lastModifiedBy: data.jcr.nodeById.lastModifiedBy?.value,
        lastPublished: data.jcr.nodeById.lastPublished?.value,
        lastPublishedBy: data.jcr.nodeById.lastPublishedBy?.value,
        publicationInfoPolling: polling,
        startPublicationInfoPolling: () => {
            setPolling(true);
        },
        stopPublicationInfoPolling: () => {
            setPolling(false);
        }
    };
};
