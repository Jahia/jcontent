import gql from 'graphql-tag';
import {PredefinedFragments} from '@jahia/data-helper';

const RenameMutation = gql`
    mutation RenameMutation($parentPath: String!, $newName: String!) {
        jcr {
            mutateNode(pathOrId: $parentPath) {
                rename(name: $newName)
                node {
                    uuid
                    name
                    path
                    ...NodeCacheRequiredFields
                }
            }
        }
    }
    ${PredefinedFragments.nodeCacheRequiredFields.gql}
`;

export {RenameMutation};
