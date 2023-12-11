import gql from 'graphql-tag';
import {PredefinedFragments} from '@jahia/data-helper';

export const VisibilityQuery = gql`query($path:String!) {
    jcr {
        nodeByPath(path: $path) {
            ...NodeCacheRequiredFields
            rules: descendants(typesFilter:{types: ["jnt:condition"], multi: ALL}) {
                pageInfo {
                    totalCount
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
