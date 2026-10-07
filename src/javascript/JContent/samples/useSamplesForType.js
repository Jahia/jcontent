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
        fetchPolicy: 'cache-first',
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
