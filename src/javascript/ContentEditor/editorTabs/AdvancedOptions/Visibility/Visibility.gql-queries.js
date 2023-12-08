import gql from 'graphql-tag';
import {PredefinedFragments} from '@jahia/data-helper';

export const VisibilityQuery = gql`query($path:String!) {
    jcr {
        nodeByPath(path: $path) {
            ...NodeCacheRequiredFields
            children(names:["j:conditionalVisibility"]) {
                nodes {
                    ...NodeCacheRequiredFields
                }
            }
            invalidLanguages: property(name:"j:invalidLanguages") {
                values
            }
        }
    }
}

${PredefinedFragments.nodeCacheRequiredFields.gql}
`;
