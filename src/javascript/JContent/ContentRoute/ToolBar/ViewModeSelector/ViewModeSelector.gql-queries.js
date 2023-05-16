import gql from 'graphql-tag';
import {PredefinedFragments} from '@jahia/data-helper';

export const GetContentType = gql`
    query getContentType($path:String!) {
        jcr {
            node: nodeByPath(path:$path) {
                ...NodeCacheRequiredFields
                isDisplayableNode
            }
        }
    }
    ${PredefinedFragments.nodeCacheRequiredFields.gql}
`;
