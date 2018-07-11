import gql from "graphql-tag";

class BrowsingQueryHandler {

    getQuery() {
        return allContentQuery;
    }

    getQueryParams(path, contentLayoutWidgetProps, contentLayoutWidgetState, dxContext) {
        return {
            path: path,
            language: contentLayoutWidgetState.language,
            displayLanguage: contentLayoutWidgetProps.dxContext.uilang,
            offset: contentLayoutWidgetState.page * contentLayoutWidgetState.rowsPerPage,
            limit: contentLayoutWidgetState.rowsPerPage
        };
    }
}

class Sql2SearchQueryHandler {

    getQuery() {
        return sql2SearchContentQuery;
    }

    getQueryParams(path, contentLayoutWidgetProps, contentLayoutWidgetState, dxContext) {

        let {from, where, orderBy} = contentLayoutWidgetProps.sql2Search;
        let query = "select * from[" + from + "] as node where ISDESCENDANTNODE(node, '/sites/" + dxContext.siteKey + "')";
        if (where && where != "") {
            query = query + " and (" + where + ")";
        }
        query = query + " order by [" + orderBy + "]";

        return {
            query: query,
            language: contentLayoutWidgetState.language,
            displayLanguage: contentLayoutWidgetProps.dxContext.uilang,
            offset: contentLayoutWidgetState.page * contentLayoutWidgetState.rowsPerPage,
            limit: contentLayoutWidgetState.rowsPerPage
        };
    }
}

const allContentQuery = gql`

    query($path:String!, $language:String!, $displayLanguage:String!, $offset:Int, $limit:Int) {
        jcr {
            results: nodesByCriteria(criteria: {nodeType: "jnt:content", paths: [$path]}, offset: $offset, limit: $limit) {
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
                        displayName(language: $displayLanguage)
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

const sql2SearchContentQuery = gql`

    query($query:String!, $language:String!, $displayLanguage:String!, $offset:Int, $limit:Int) {
        jcr {
            results: nodesByQuery(query: $query, queryLanguage: SQL2, offset: $offset, limit: $limit) {
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
                        displayName(language: $displayLanguage)
                        icon
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

export {BrowsingQueryHandler, Sql2SearchQueryHandler};
