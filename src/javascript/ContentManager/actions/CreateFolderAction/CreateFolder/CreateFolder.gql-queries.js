import gql from 'graphql-tag';
import {PredefinedFragments} from '@jahia/apollo-dx';

const CreateFolderQuery = gql`
    query FolderQuery($path:String!, $typesFilter: InputNodeTypesInput!) {
        jcr {
            nodeByPath(path: $path) {
                id: uuid
                name
                children(typesFilter: $typesFilter) {
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
