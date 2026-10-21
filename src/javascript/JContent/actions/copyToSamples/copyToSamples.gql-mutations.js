import gql from 'graphql-tag';
import {PredefinedFragments} from '@jahia/data-helper';

/**
 * Creates the samples branch together with the category the sample is about to land in.
 *
 * The module's provisioning patch only reaches the sites that existed when it ran, so a site created
 * afterwards has no samples branch until someone saves the first sample. Neither type has a
 * mandatory property, so this needs nothing from the author.
 */
export const CreateSamplesFolderMutation = gql`
    mutation createSamplesFolder($sitePath: String!, $samplesName: String!, $samplesType: String!, $categoryName: String!, $categoryType: String!) {
        jcr {
            addNode(name: $samplesName, primaryNodeType: $samplesType, parentPathOrId: $sitePath, children: [{name: $categoryName, primaryNodeType: $categoryType}]) {
                node {
                    ...NodeCacheRequiredFields
                    path
                    category: descendant(relPath: $categoryName) {
                        ...NodeCacheRequiredFields
                        path
                    }
                }
            }
        }
    }
    ${PredefinedFragments.nodeCacheRequiredFields.gql}
`;

/** Creates one missing category under an existing samples branch. */
export const CreateSampleCategoryMutation = gql`
    mutation createSampleCategory($samplesPath: String!, $categoryName: String!, $categoryType: String!) {
        jcr {
            addNode(name: $categoryName, primaryNodeType: $categoryType, parentPathOrId: $samplesPath) {
                node {
                    ...NodeCacheRequiredFields
                    path
                }
            }
        }
    }
    ${PredefinedFragments.nodeCacheRequiredFields.gql}
`;

/**
 * Marks a saved sample as never going live.
 *
 * The samples root carries jmix:nolive too, but that only protects a publication that walks into
 * the branch: JCRPublicationService tests the mixin on each node it is handed, so a publish aimed
 * straight at a sample - a GraphQL mutation, a script, a scheduled publication - never looks at the
 * ancestor. The mixin on the sample itself is what closes that.
 *
 * Safe to put here only because core excludes jmix:nolive from forbiddenMixinToCopy; without that,
 * every node pasted from a sample would inherit it and become silently unpublishable.
 */
export const MarkSampleNoLiveMutation = gql`
    mutation markSampleNoLive($pathOrId: String!) {
        jcr {
            mutateNode(pathOrId: $pathOrId) {
                addMixins(mixins: ["jmix:nolive"])
            }
        }
    }
`;

/** Removes the sample being replaced, so the fresh copy can take its name back. */
export const DeleteSampleMutation = gql`
    mutation deleteSample($pathOrId: String!) {
        jcr {
            deleteNode(pathOrId: $pathOrId)
        }
    }
`;
