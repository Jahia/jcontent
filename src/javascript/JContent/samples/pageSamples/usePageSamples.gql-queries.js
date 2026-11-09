import gql from 'graphql-tag';
import {PredefinedFragments} from '@jahia/data-helper';

/**
 * The page samples the site holds, for the dropdown shown when creating a page.
 *
 * Resolved from the parent the page is being created under, by uuid: the create flow knows its
 * parent, not the site, and JCRSite exposes descendant() like any node, so one round trip does it.
 *
 * Only direct children of the "pages" category count - a sample page keeps its own content, and
 * that content is not itself a sample.
 */
export const PageSamplesQuery = gql`
    query getPageSamples($parentUuid: String!, $samplesFolderName: String!, $pagesName: String!, $uilang: String!) {
        jcr {
            parent: nodeById(uuid: $parentUuid) {
                ...NodeCacheRequiredFields
                site {
                    ...NodeCacheRequiredFields
                    samples: descendant(relPath: $samplesFolderName) {
                        ...NodeCacheRequiredFields
                        pages: descendant(relPath: $pagesName) {
                            ...NodeCacheRequiredFields
                            samples: children(typesFilter: {types: ["jnt:page"], multi: ANY}) {
                                nodes {
                                    ...NodeCacheRequiredFields
                                    path
                                    displayName(language: $uilang)
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    ${PredefinedFragments.nodeCacheRequiredFields.gql}
`;
