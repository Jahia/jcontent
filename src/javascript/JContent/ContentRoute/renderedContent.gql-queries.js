import gql from 'graphql-tag';
import {PredefinedFragments} from '@jahia/data-helper';

export const RenderCheckQuery = gql`
    query renderCheck($path: String!) {
        jcr {
            nodeByPath(path: $path) {
                ...NodeCacheRequiredFields
                isDisplayableNode
            }
        }
    }
    ${PredefinedFragments.nodeCacheRequiredFields.gql}
`;
