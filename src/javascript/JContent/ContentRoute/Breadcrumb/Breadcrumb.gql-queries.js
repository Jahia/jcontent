import gql from 'graphql-tag';
import {PredefinedFragments} from '@jahia/data-helper';

const breadcrumbQuery = gql`
    query breadcrumbQuery($path:String!, $language: String!) {
        jcr {
            nodeByPath(path:$path) {
                uuid
                displayName(language: $language)
                primaryNodeType {
                    name
                }
                ancestors(fieldFilter: {filters: [{evaluation: DIFFERENT, fieldName: "type.name", value: "jnt:virtualsite"}, {evaluation: DIFFERENT, fieldName: "type.name", value: "rep:root"}, {evaluation: DIFFERENT, fieldName: "type.name", value: "jnt:virtualsitesFolder"}]}){
                    uuid
                    path
                    displayName(language: $language)
                    type: primaryNodeType {
                        name
                    }
                }
               ...NodeCacheRequiredFields
            }
        }
    }
    ${PredefinedFragments.nodeCacheRequiredFields.gql}
`;

export {breadcrumbQuery};
