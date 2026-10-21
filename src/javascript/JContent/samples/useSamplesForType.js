import {useQuery} from '@apollo/client';
import {SamplesForTypeQuery} from './useSamplesForType.gql-queries';
import {getSamplesPreviewPagePath, SAMPLES_COMPONENTS_NAME, SAMPLES_FOLDER_NAME} from './samples.utils';

/**
 * The component samples the current site holds for one content type.
 *
 * Most content types have no sample, and a site may have no samples branch at all, so an empty
 * result is the ordinary case rather than a problem.
 *
 * @param {object} options - hook options
 * @param {string} options.parentUuid - the node the content will be created under; identifies the site
 * @param {string} options.nodeType - the content type being previewed
 * @param {boolean} [options.skip] - skip the query, e.g. while no type is selected
 * @returns {{samples: Array, previewPagePath: string, loading: boolean, error: object}} - what the picker needs
 */
export const useSamplesForType = ({parentUuid, nodeType, skip = false}) => {
    const isSkipped = skip || !parentUuid || !nodeType;

    const {data, loading, error} = useQuery(SamplesForTypeQuery, {
        variables: {
            parentUuid,
            samplesFolderName: SAMPLES_FOLDER_NAME,
            componentsName: SAMPLES_COMPONENTS_NAME,
            nodeType,
            uilang: contextJsParameters.uilang
        },
        // cache-and-network, not cache-first: a sample saved from jContent cannot invalidate this
        // query, because the picker - and this hook with it - is only mounted while the modal is
        // open, so triggerRefetchAll() in writeSample has no refetcher to reach. cache-first would
        // keep serving the empty result this type returned before the sample existed.
        fetchPolicy: 'cache-and-network',
        errorPolicy: 'all',
        skip: isSkipped
    });

    const site = data?.jcr?.parent?.site;

    return {
        samples: site?.samples?.components?.matches?.nodes ?? [],
        previewPagePath: getSamplesPreviewPagePath(site?.homePage?.path),
        loading: !isSkipped && loading,
        error
    };
};
