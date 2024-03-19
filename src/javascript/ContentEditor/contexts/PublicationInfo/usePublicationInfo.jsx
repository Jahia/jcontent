import {useQuery, useSubscription} from '@apollo/client';
import {PublicationInfoQuery} from './PublicationInfo.gql-queries';
import {
    SubscribeToPublicationData
} from '~/JContent/PublicationStatus/PublicationNotification/PublicationNotification.gql-subscription';

export const usePublicationInfo = (queryParams, t) => {
    const {loading, error, data, refetch} = useQuery(PublicationInfoQuery, {
        variables: queryParams,
        fetchPolicy: 'network-only'
    });

    const {error: subError} = useSubscription(SubscribeToPublicationData, {
        fetchPolicy: 'network-only',
        onData: ({data}) => {
            console.log('data', data);
            if (data?.data?.subscribeToPublicationJob?.state === 'UNPUBLISHED' || data?.data?.subscribeToPublicationJob?.state === 'FINISHED') {
                refetch();
            }
        }
    });

    if (error || loading || subError || !data?.jcr) {
        return {
            publicationInfoPolling: true,
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
        publicationInfoPolling: false
    };
};
