import gql from 'graphql-tag';
import {PredefinedFragments} from '@jahia/data-helper';

const CreateFolderMutation = gql`
    mutation CreateFolderMutation($parentPath: String!, $folderName: String!, $primaryNodeType: String!) {
        jcr {
            addNode(parentPathOrId: $parentPath, name: $folderName, primaryNodeType: $primaryNodeType) {
                node {
                    name
                    path
                    ...NodeCacheRequiredFields
                }
            }
        }
    }
    ${PredefinedFragments.nodeCacheRequiredFields.gql}
`;

export {CreateFolderMutation};
