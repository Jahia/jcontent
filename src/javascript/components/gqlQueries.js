import gql from "graphql-tag";
import {PredefinedFragments} from "@jahia/apollo-dx";
import * as _ from 'lodash';
import {replaceFragmentsInDocument} from "@jahia/apollo-dx/index";

class BrowsingQueryHandler {

    getQuery() {
        return getNodeSubTree;
    }

    getQueryParams(path, contentLayoutWidgetState, dxContext, urlParams) {
        const type = urlParams.type || "contents";
        return {
            path: path,
            language: dxContext.lang,
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
            language: dxContext.lang,
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
            language: dxContext.lang,
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
            language: dxContext.lang,
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
    pages: {recursionTypesFilter: ["jnt:page"], typeFilter: ["jmix:editorialContent"]},
    contents: {recursionTypesFilter: ["jnt:contentFolder"], typeFilter: ["jmix:editorialContent"]}
};

const nodeFields = gql `
    fragment NodeFields on JCRNode {
        aggregatedPublicationInfo(language: $language) {
            publicationStatus
        }
        name
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
        lockOwner: property(name: "jcr:lockOwner", language: $language) {
            value
        }
        lastPublished: property(name: "j:lastPublished", language: $language) {
            value
        }
        lastPublishedBy: property(name: "j:lastPublishedBy", language: $language) {
            value
        }
        lastModifiedBy: property(name: "jcr:lastModifiedBy", language: $language) {
            value
        }
        lastModified: property(name: "jcr:lastModified", language: $language) {
            value
        }
        deletedBy: property(name: "j:deletionUser", language: $language) {
            value
        }
        deleted: property(name: "j:deletionDate", language: $language) {
            value
        }
        wipStatus: property(name: "j:workInProgressStatus") {
            value
        }
        wipLangs: property(name: "j:workInProgressLanguages") {
            values
        }
        ...NodeCacheRequiredFields
    }
${PredefinedFragments.nodeCacheRequiredFields.gql}`;

const getNodeSubTree = gql`
    query getNodeSubTree($path:String!, $language:String!, $offset:Int, $limit:Int, $displayLanguage:String!, $typeFilter:[String]!, $recursionTypesFilter:[String]!) {
        jcr {
            results: nodeByPath(path: $path) {
                ...NodeCacheRequiredFields
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

const GetNodeByPathQuery = gql `
    query GetNodeByPathQuery($path: String!, $language: String!, $displayLanguage:String!) {
        jcr {
            results: nodeByPath(path: $path) {
                ...NodeFields
            }
        }
    }
    ${nodeFields}
`;

const searchContentQuery = gql `
    query searchContentQuery($path:String!, $nodeType:String!, $searchTerms:String!, $language:String!, $displayLanguage:String!, $offset:Int, $limit:Int) {
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

`;

const sql2SearchContentQuery = gql `
    query sql2SearchContentQuery($query:String!, $language:String!, $displayLanguage:String!, $offset:Int, $limit:Int) {
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

`;

const filesQuery = gql`
    query Files($path:String!, $language:String!, $offset:Int, $limit:Int, $displayLanguage:String!, $typeFilter:[String]!, $recursionTypesFilter:[String]!) {
        jcr {
            results: nodeByPath(path: $path) {
                id : uuid
                ...NodeCacheRequiredFields
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
                    }
                }
            }
        }
    }
    ${nodeFields}
`;

const ContentTypesQuery = gql `
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

const ContentTypeQuery = gql`
    query ContentTypeQuery($nodeType: String!, $displayLanguage: String!) {
  jcr {
    nodeTypeByName(name: $nodeType) {
      displayName(language: $displayLanguage)
    }
  }
}
`;

const LoadSelectionQuery = gql`
    query LoadSelectionQuery($paths: [String!]!, $language:String!, $displayLanguage:String!) {
        jcr {
            nodesByPath(paths: $paths) {
                ...NodeFields
                contributeTypes: property(name: "j:contributeTypes") {
                    values
                }
                primaryNodeType {
                    name
                    supertypes {
                        name
                    }
                }
            }
        }
    }
    ${nodeFields}
`;

let getRequirementsQuery = () => _.cloneDeep(gql `
    query CheckRequirementsQuery($path:String!) {
        jcr {
            nodeByPath(path:$path) {
                ...NodeCacheRequiredFields
                ...requirements
            }
        }
    }
    ${PredefinedFragments.nodeCacheRequiredFields.gql}
`);

const RequirementFragments = {
    isNodeType: {
        variables: {
            isNodeType: "InputNodeTypesInput!"
        },
        applyFor: "requirements",
        gql: gql `fragment NodeIsNodeType on JCRNode {
            isNodeType(type: $isNodeType)
        }`
    },
    isNotNodeType: {
        variables: {
            isNotNodeType: "InputNodeTypesInput!"
        },
        applyFor: "requirements",
        gql: gql `fragment NodeIsNotNodeType on JCRNode {
            isNotNodeType: isNodeType(type: $isNotNodeType)
        }`
    },
    permission: {
        variables: {
            permission: "String!"
        },
        applyFor: "requirements",
        gql: gql `fragment NodeHasPermission on JCRNode {
            hasPermission(permissionName: $permission)
        }`
    },
    allowedChildNodeTypes: {
        applyFor: "requirements",
        gql: gql `fragment ProvideTypes on JCRNode {
            allowedChildNodeTypes {
                name
            }
            contributeTypes: property(name: "j:contributeTypes") {
                values
            }
        }`
    },
}

class RequirementQueryHandler {

    constructor(path, action) {
        this.checkRequirementFragments = [];
        this.variables = {path: path};
        if (!_.isEmpty(action.requiredPermission)) {
            this.checkRequirementFragments.push(RequirementFragments.permission);
            this.variables.permission = action.requiredPermission;
        }
        if (!_.isEmpty(action.hideOnNodeTypes)) {
            this.checkRequirementFragments.push(RequirementFragments.isNotNodeType);
            this.variables.isNotNodeType = {types: action.hideOnNodeTypes};
        }
        if (!_.isEmpty(action.showOnNodeTypes)) {
            this.checkRequirementFragments.push(RequirementFragments.isNodeType);
            this.variables.isNodeType = {types: action.showOnNodeTypes};
        }
        if (_.isEmpty(action.requiredAllowedChildNodeTypes) && action.provideAllowedChildNodeTypes) {
            this.checkRequirementFragments.push(RequirementFragments.allowedChildNodeTypes);
        }
    }

    getQuery() {
        let requirementsQuery = getRequirementsQuery();
        replaceFragmentsInDocument(requirementsQuery, this.checkRequirementFragments);
        return requirementsQuery;
    }

    getVariables() {
        return this.variables;
    }
}

export {
    BrowsingQueryHandler,
    SearchQueryHandler,
    Sql2SearchQueryHandler,
    FilesQueryHandler,
    ContentTypesQuery,
    ContentTypeQuery,
    LoadSelectionQuery,
    GetNodeByPathQuery,
    RequirementQueryHandler
};
