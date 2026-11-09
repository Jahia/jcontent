import gql from 'graphql-tag';
import {PredefinedFragments} from '@jahia/data-helper';
import {
    NodePreviewFieldsFragment
} from '~/JContent/ContentRoute/ContentLayout/queryHandlers/BaseQueryHandler.gql-queries';

/**
 * The component samples the current site holds for one content type, plus the page the preview will
 * borrow its CSS from.
 *
 * Only direct children of the "components" category count. A sample keeps its own content - an
 * agency sample carries its listings, or it would preview as an empty box - but those internals are
 * not themselves samples, and matching them would flood the picker with every child of every sample.
 * A sample is exactly what somebody chose to save, never something that came along with it.
 *
 * The site is resolved from the parent node rather than passed in: the create flow knows the parent
 * by uuid, not by path, and JCRSite exposes descendant() like any node, so one round trip does the
 * whole lookup. Samples are per-site on purpose - the same content type is laid out differently from
 * one template set to the next.
 */
export const SamplesForTypeQuery = gql`
    query getSamplesForType($parentUuid: String!, $samplesFolderName: String!, $componentsName: String!, $nodeType: String!, $uilang: String!) {
        jcr {
            parent: nodeById(uuid: $parentUuid) {
                ...NodeCacheRequiredFields
                site {
                    ...NodeCacheRequiredFields
                    homePage {
                        ...NodeCacheRequiredFields
                        path
                    }
                    samples: descendant(relPath: $samplesFolderName) {
                        ...NodeCacheRequiredFields
                        components: descendant(relPath: $componentsName) {
                            ...NodeCacheRequiredFields
                            matches: children(typesFilter: {types: [$nodeType], multi: ANY}) {
                                nodes {
                                    ...NodeCacheRequiredFields
                                    path
                                    displayName(language: $uilang)
                                    ...NodePreviewFields
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    ${PredefinedFragments.nodeCacheRequiredFields.gql}
    ${NodePreviewFieldsFragment}
`;
