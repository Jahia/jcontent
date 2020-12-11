import gql from 'graphql-tag';

const previewSizeQuery = gql`query getImageMetadata($workspace: Workspace!, $path: String!) {
    jcr(workspace: $workspace) {
        nodeByPath(path: $path) {
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
                    data: property(name: "jcr:data") {
                        size
                    }
                }
            }
        }
    }
}`;

export {previewSizeQuery};
