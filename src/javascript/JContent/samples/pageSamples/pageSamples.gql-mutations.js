import gql from 'graphql-tag';
import {PredefinedFragments} from '@jahia/data-helper';

/**
 * Applies the values the author typed to a page that was just copied from a sample.
 *
 * The copy arrives carrying the sample's own properties - its title above all - so without this the
 * author would name a page and still see the sample's title on it.
 */
export const ApplySamplePropertiesMutation = gql`
    mutation applySampleProperties($pathOrId: String!, $properties: [InputJCRProperty]) {
        jcr {
            mutateNode(pathOrId: $pathOrId) {
                setPropertiesBatch(properties: $properties) {
                    path
                }
                node {
                    ...NodeCacheRequiredFields
                    path
                }
            }
        }
    }
    ${PredefinedFragments.nodeCacheRequiredFields.gql}
`;
