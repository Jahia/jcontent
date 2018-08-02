import gql from "graphql-tag";

class BrowsingQueryHandler {

    getQuery() {
        return getNodeSubTree;
    }

    getQueryParams(path, contentLayoutWidgetState, dxContext, urlParams) {
        const type = urlParams.type || "contents";
        return {
            path: path,
            language: contentLayoutWidgetState.language,
            displayLanguage: dxContext.uilang,
            offset: contentLayoutWidgetState.page * contentLayoutWidgetState.rowsPerPage,
            limit: contentLayoutWidgetState.rowsPerPage,
            typeFilter: browseType[type].typeFilter || "jnt:contentFolder",
            recursionTypesFilter: browseType[type].recursionTypesFilter || "jmix:editorialContent"
        };
    }

    getResultsPath(results) {
        return results.descendants;
    }
}

class FilesQueryHandler {

    getQuery() {
        return filesQuery;
    }

    getQueryParams(path, contentLayoutWidgetState, dxContext) {
        return {
            path: path,
            language: contentLayoutWidgetState.language,
            displayLanguage: dxContext.uilang,
            offset: contentLayoutWidgetState.page * contentLayoutWidgetState.rowsPerPage,
            limit: contentLayoutWidgetState.rowsPerPage,
            typeFilter: "jnt:file",
            recursionTypesFilter: "jnt:folder"
        };
    }

    getResultsPath(results) {
        return results.descendants;
    }
}

class SearchQueryHandler {

    getQuery() {
        return searchContentQuery;
    }

    getQueryParams(path, contentLayoutWidgetState, dxContext, urlParams) {
        return {
            path: `/sites/${dxContext.siteKey}`,
            nodeType: (urlParams.searchContentType == null ? "jmix:searchable" : urlParams.searchContentType),
            searchTerms: urlParams.searchTerms,
            language: contentLayoutWidgetState.language,
            displayLanguage: dxContext.uilang,
            offset: contentLayoutWidgetState.page * contentLayoutWidgetState.rowsPerPage,
            limit: contentLayoutWidgetState.rowsPerPage,
        };
    }

    getResultsPath(results) {
        return results;
    }
}

class Sql2SearchQueryHandler {

    getQuery() {
        return sql2SearchContentQuery;
    }

    getQueryParams(path, contentLayoutWidgetState, dxContext, urlParams) {

        let {sql2SearchFrom, sql2SearchWhere} = urlParams;
        let query = `SELECT * FROM [${sql2SearchFrom}] WHERE ISDESCENDANTNODE('/sites/${dxContext.siteKey}')`;
        if (sql2SearchWhere && sql2SearchWhere !== "") {
            query = query + ` AND (${sql2SearchWhere})`;
        }

        return {
            query: query,
            language: contentLayoutWidgetState.language,
            displayLanguage: dxContext.uilang,
            offset: contentLayoutWidgetState.page * contentLayoutWidgetState.rowsPerPage,
            limit: contentLayoutWidgetState.rowsPerPage
        };
    }

    getResultsPath(results) {
        return results;
    }
}

const browseType = {
    pages: {recursionTypesFilter:["jnt:page"], typeFilter:["jmix:editorialContent"]},
    contents: {recursionTypesFilter:["jnt:contentFolder"], typeFilter:["jmix:editorialContent"]}
};

const nodeFields = gql`
    fragment NodeFields on JCRNode {
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
`;

const getNodeSubTree = gql `
    query($path:String!, $language:String!, $offset:Int, $limit:Int, $displayLanguage:String!, $typeFilter:[String]!, $recursionTypesFilter:[String]!) {
        jcr {
            results: nodeByPath(path: $path) {
                descendants(offset:$offset, limit:$limit, typesFilter: {types: $typeFilter, multi:ANY}, recursionTypesFilter: {multi: NONE, types: $recursionTypesFilter}) {
                    pageInfo {
                        totalCount
                    }
                    nodes {
                    ...NodeFields
                    }
                }
            }
        }
    }
    ${nodeFields}
`;

const searchContentQuery = gql`
    query($path:String!, $nodeType:String!, $searchTerms:String!, $language:String!, $displayLanguage:String!, $offset:Int, $limit:Int) {
        jcr {
            results: nodesByCriteria(criteria: {language: $language, nodeType: $nodeType, paths: [$path], nodeConstraint: {contains: $searchTerms}}, offset: $offset, limit: $limit) {
                pageInfo {
                    totalCount
                }
                nodes {
                    ...NodeFields
                }
            }
        }
    }
    ${nodeFields}
`;

const sql2SearchContentQuery = gql`
    query($query:String!, $language:String!, $displayLanguage:String!, $offset:Int, $limit:Int) {
        jcr {
            results: nodesByQuery(query: $query, queryLanguage: SQL2, language: $language, offset: $offset, limit: $limit) {
                pageInfo {
                    totalCount
                }
                nodes {
                    ...NodeFields
                }
            }
        }
    }
    ${nodeFields}
`;

const filesQuery = gql `
    query Files($path:String!, $language:String!, $offset:Int, $limit:Int, $displayLanguage:String!, $typeFilter:[String]!, $recursionTypesFilter:[String]!) {
        jcr {
            results: nodeByPath(path: $path) {
                descendants(offset:$offset, limit:$limit, typesFilter: {types: $typeFilter, multi:ANY}, recursionTypesFilter: {multi: NONE, types: $recursionTypesFilter}) {
                    pageInfo {
                        totalCount
                    }
                    nodes {
                    ...NodeFields
                    width: property(name: "j:width") {
                            value
                        }
                    height: property(name: "j:height") {
                        value
                        }
                    fileChildren :children {
                        nodes {
                          name
                          mime :property(name: "jcr:mimeType") {
                            value
                          }
                        }
                      }
                    }
                }
            }
        }
    }
    ${nodeFields}
`;

const ContentTypesQuery = gql`
    query ContentTypesQuery($siteKey: String!, $displayLanguage:String!) {
      jcr {
        nodeTypes(filter: {includeMixins: false, siteKey: $siteKey, includeTypes: ["jmix:editorialContent", "jnt:page", "jnt:file"], excludeTypes: ["jmix:studioOnly", "jmix:hiddenType", "jnt:editableFile"]}) {
          nodes {
            name
            displayName(language: $displayLanguage)
            icon
          }
        }
      }
    }
`;

export {BrowsingQueryHandler, SearchQueryHandler, Sql2SearchQueryHandler, FilesQueryHandler, ContentTypesQuery};
