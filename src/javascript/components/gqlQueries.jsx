import gql from "graphql-tag";

const TableQueryVariables = (path, props) => ({
    path: path,
    offset: props.page,
    limit: props.rowsPerPage
});

const allContentQuery = gql`

    query($path:String!, $offset:Int, $limit:Int) {
        jcr {
            nodesByCriteria(criteria: {nodeType: "jnt:content", paths: [$path]}, offset: $offset, limit: $limit) {
                pageInfo {
                    totalCount
                }
                nodes {
                    aggregatedPublicationInfo(language: "en") {
                        publicationStatus
                    }
                    name
                    path
                    displayName
                    createdBy: property(name: "jcr:createdBy") {
                        value
                    }
                    created: property(name: "jcr:created") {
                        value
                    }
                    primaryNodeType {
                        name
                    }
                    lockOwner: property(name: "jcr:lockOwner") {
                        value
                    }
                    lastPublished: property(name: "j:lastPublished") {
                        value
                    }
                    lastPublishedBy: property(name: "j:lastPublishedBy") {
                        value
                    }
                    lastModifiedBy: property(name: "jcr:lastModifiedBy") {
                        value
                    }
                    lastModified: property(name: "jcr:lastModified") {
                        value
                    }
                }
            }
        }
    }`;

export {allContentQuery, TableQueryVariables};