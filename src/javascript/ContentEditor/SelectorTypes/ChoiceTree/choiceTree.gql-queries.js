import gql from 'graphql-tag';
import {PredefinedFragments} from '@jahia/data-helper';

// The tree itself is now loaded lazily, one level at a time, by the shared
// `useTreeEntries` hook (see ChoiceTree.jsx). The only query left here resolves
// the uuids currently stored in the field value to their ancestor paths, so the
// branches that lead to a current selection can be pre-opened (and fetched)
// without loading the whole tree.
export const GetSelectedEntries = gql`
    query getChoiceTreeSelectedEntries($uuids: [String!]!, $rootPath: String!) {
        jcr {
            nodesById(uuids: $uuids) {
                ...NodeCacheRequiredFields
                ancestors(upToPath: $rootPath) {
                    ...NodeCacheRequiredFields
                }
            }
        }
    }
    ${PredefinedFragments.nodeCacheRequiredFields.gql}`;
