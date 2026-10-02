import gql from 'graphql-tag';
import {PredefinedFragments} from '@jahia/data-helper';

/**
 * Everything saving one node as a sample needs, in a single round trip: whether the node is a page
 * (which decides the category it lands in), its site, and which parts of the samples structure are
 * already there.
 *
 * It also reports whether that category already holds a sample of the same name, which is how a
 * repeat save is caught. Identity is by name rather than by a recorded origin on purpose: a property
 * would need a mixin, and mixins travel with a copy - so every node later inserted *from* a sample
 * would carry it, the same way jmix:nolive would have.
 *
 * Run on click rather than on mount - the action appears on every row, and none of this is needed
 * until somebody actually saves a sample.
 */
export const SampleDestinationQuery = gql`
    query getSampleDestination($path: String!, $sourceName: String!, $samplesFolderName: String!, $pagesName: String!, $componentsName: String!) {
        jcr {
            source: nodeByPath(path: $path) {
                ...NodeCacheRequiredFields
                isPage: isNodeType(type: {types: ["jnt:page"]})
                # Only content children count: a node's translations and other technical subnodes
                # are not what an author means by "with its children".
                contentChildren: children(typesFilter: {types: ["jnt:content"], multi: ANY}) {
                    pageInfo {
                        totalCount
                    }
                }
                site {
                    ...NodeCacheRequiredFields
                    path
                    samples: descendant(relPath: $samplesFolderName) {
                        ...NodeCacheRequiredFields
                        path
                        pages: descendant(relPath: $pagesName) {
                            ...NodeCacheRequiredFields
                            path
                            existing: descendant(relPath: $sourceName) {
                                ...NodeCacheRequiredFields
                                path
                            }
                        }
                        components: descendant(relPath: $componentsName) {
                            ...NodeCacheRequiredFields
                            path
                            existing: descendant(relPath: $sourceName) {
                                ...NodeCacheRequiredFields
                                path
                            }
                        }
                    }
                }
            }
        }
    }
    ${PredefinedFragments.nodeCacheRequiredFields.gql}
`;
