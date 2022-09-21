import gql from 'graphql-tag';
import {PredefinedFragments} from '@jahia/data-helper';

const RenameQuery = gql`
    query RenameQuery($path:String!) {
        jcr {
            nodeByPath(path: $path) {
                name
                parent {
                    children {
                        nodes {
                            name
                            ...NodeCacheRequiredFields
                        }
                    }
                    ...NodeCacheRequiredFields
                }
                ...NodeCacheRequiredFields
            }
        }
    }
    ${PredefinedFragments.nodeCacheRequiredFields.gql}
`;

export {RenameQuery};
