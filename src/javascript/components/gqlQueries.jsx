import gql from "graphql-tag";

const TableQueryVariables = (path, language, props) => ({
    path: path,
    language: language,
    offset: props.page * props.rowsPerPage,
    limit: props.rowsPerPage
});

const allContentQuery = gql`

    query($path:String!, $language:String!, $offset:Int, $limit:Int) {
        jcr {
            nodesByCriteria(criteria: {nodeType: "jnt:content", paths: [$path]}, offset: $offset, limit: $limit) {
                pageInfo {
                    totalCount
                }
                nodes {
                    aggregatedPublicationInfo(language: $language) {
                        publicationStatus
                    }
                    uuid
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
                    deletedBy: property(name: "j:deletionUser") {
                        value
                    }
                    deleted: property(name: "j:deletionDate") {
                        value
                    }
                    wipStatus: property(name: "j:workInProgressStatus") {
                        value
                    }
                    wipLangs: property(name: "j:workInProgressLanguages") {
                        values
                    }
                }
            }
        }
    }`;

const previewQuery = gql`query($path:String!) {
    jcr {
        nodeByPath(path:$path) {
            renderedContent(templateType:"html", view:"cm", contextConfiguration:"default") {
                output
            }
        }
    }
  }`;

export {allContentQuery, previewQuery, TableQueryVariables};