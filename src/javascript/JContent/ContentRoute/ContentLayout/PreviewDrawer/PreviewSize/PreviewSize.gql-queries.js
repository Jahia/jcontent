import gql from 'graphql-tag';
import {PredefinedFragments} from '@jahia/data-helper';

const previewSizeQuery = gql`query getImageMetadata($workspace: Workspace!, $path: String!) {
    jcr(workspace: $workspace) {
        nodeByPath(path: $path) {
            ...NodeCacheRequiredFields
            id: uuid
            path
            workspace
            width: property(name:"j:width") {
                value
            }
            height: property(name: "j:height") {
              value
            }
            children(typesFilter: {types: ["jnt:resource"]}, names:["jcr:content"]) {
                nodes {
                    ...NodeCacheRequiredFields
                    data: property(name: "jcr:data") {
                        size
                    }
                }
            }
        }
    }
}
${PredefinedFragments.nodeCacheRequiredFields.gql}
`;

export {previewSizeQuery};
