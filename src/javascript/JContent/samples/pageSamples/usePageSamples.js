import {useQuery} from '@apollo/client';
import {PageSamplesQuery} from './usePageSamples.gql-queries';
import {SAMPLES_FOLDER_NAME, SAMPLES_PAGES_NAME} from '../samples.utils';

/**
 * The page samples available when creating a page under a given parent.
 *
 * A site with no samples branch, or none holding page samples, is the ordinary case rather than a
 * problem, so an empty list is a normal answer and errors are swallowed into one: the page creation
 * form must keep working whatever the samples branch looks like.
 *
 * @param {object} options - hook options
 * @param {string} options.parentUuid - the node the page will be created under; identifies the site
 * @param {boolean} [options.skip] - skip the query, e.g. when not creating a page
 * @returns {{samples: Array, loading: boolean}} - the samples and whether they are still coming
 */
export const usePageSamples = ({parentUuid, skip = false}) => {
    const isSkipped = skip || !parentUuid;

    const {data, loading} = useQuery(PageSamplesQuery, {
        variables: {
            parentUuid,
            samplesFolderName: SAMPLES_FOLDER_NAME,
            pagesName: SAMPLES_PAGES_NAME,
            uilang: contextJsParameters.uilang
        },
        fetchPolicy: 'cache-first',
        errorPolicy: 'all',
        skip: isSkipped
    });

    return {
        samples: data?.jcr?.parent?.site?.samples?.pages?.samples?.nodes ?? [],
        loading: !isSkipped && loading
    };
};
