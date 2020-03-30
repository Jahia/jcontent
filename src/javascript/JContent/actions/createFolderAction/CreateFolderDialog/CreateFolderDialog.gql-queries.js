import gql from 'graphql-tag';
import {PredefinedFragments} from '@jahia/data-helper';

const CreateFolderQuery = gql`
    query FolderQuery($path:String!) {
        jcr {
            nodeByPath(path: $path) {
                id: uuid
                name
                children {
                    nodes {
                        name
                        ...NodeCacheRequiredFields
                    }
                }
                ...NodeCacheRequiredFields
            }
        }
    }
    ${PredefinedFragments.nodeCacheRequiredFields.gql}
`;

export {CreateFolderQuery};
