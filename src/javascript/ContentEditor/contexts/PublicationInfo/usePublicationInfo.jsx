import {useQuery} from '@apollo/client';
import {PublicationInfoQuery} from './PublicationInfo.gql-queries';
import {useState} from 'react';

export const usePublicationInfo = (queryParams, t) => {
    const [polling, setPolling] = useState(false);
    const {loading, error, data} = useQuery(PublicationInfoQuery, {
        variables: queryParams,
        fetchPolicy: 'network-only',
        pollInterval: polling ? 5000 : 0
    });

    if (error || loading || !data?.jcr) {
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
