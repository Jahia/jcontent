import gql from 'graphql-tag';
import {PredefinedFragments} from '@jahia/apollo-dx';

const ImageQuery = gql`
    query ImageQuery($path:String!) {
        jcr {
            nodeByPath(path:$path) {
                width: property(name:"j:width") {
                    value
                }
                height: property(name:"j:height") {
                    value
                }
                ...NodeCacheRequiredFields
            }
        }
    }
    ${PredefinedFragments.nodeCacheRequiredFields.gql}
`;

export {ImageQuery};
