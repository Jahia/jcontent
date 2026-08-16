import gql from 'graphql-tag';
import {PredefinedFragments} from '@jahia/data-helper';

/**
 * Minimal resolution query: the side panel data hooks are uuid-based
 * (`useEditFormDefinition` queries `nodeById`), so a caller that only knows a
 * path needs the uuid first.
 */
export const ContentSidePanelNodeQuery = gql`
    query contentSidePanelNode($path: String!) {
        jcr {
            nodeByPath(path: $path) {
                ...NodeCacheRequiredFields
                primaryNodeType {
                    name
                }
            }
        }
    }
    ${PredefinedFragments.nodeCacheRequiredFields.gql}
`;
