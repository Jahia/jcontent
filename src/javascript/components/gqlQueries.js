import gql from "graphql-tag";
import {PredefinedFragments} from "@jahia/apollo-dx";
import * as _ from 'lodash';
import {replaceFragmentsInDocument} from "@jahia/apollo-dx/index";
import Constants from "./constants";

class BrowsingQueryHandler {

    getQuery() {
        return getNodeSubTree;
    }

    getQueryParams(path, paginationState, uiLang, lang, urlParams, rootPath, order, orderBy) {
        const type = urlParams.type || (_.startsWith(path, rootPath + "/contents") ? "contents" : "pages");
        return {
            path: path,
            language: lang,
            displayLanguage: uiLang,
            offset: paginationState.page * paginationState.rowsPerPage,
            limit: paginationState.rowsPerPage,
            typeFilter: browseType[type].typeFilter || "jnt:contentFolder",
            recursionTypesFilter: browseType[type].recursionTypesFilter || Constants.contentType,
            fieldSorter: orderBy === '' ? null : {
                sortType: order === '' ? null : (order==="DESC" ? "ASC" : "DESC"),
                fieldName: orderBy === '' ? null : orderBy,
                ignoreCase: true,
            }
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

    getQueryParams(path, paginationState, uiLang, lang, urlParams, rootPath, order, orderBy) {
        return {
            path: path,
            language: lang,
            displayLanguage: uiLang,
            offset: paginationState.page * paginationState.rowsPerPage,
            limit: paginationState.rowsPerPage,
            typeFilter: "jnt:file",
            recursionTypesFilter: "jnt:folder",
            fieldSorter: orderBy === '' ? null : {
                sortType: order === '' ? null : (order==="DESC" ? "ASC" : "DESC"),
                fieldName: orderBy === '' ? null : orderBy,
                ignoreCase: true,
            }
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

    getQueryParams(path, paginationState, uiLang, lang, urlParams, rootPath, order, orderBy) {
        return {
            path: path,
            nodeType: (urlParams.searchContentType == null ? "jmix:searchable" : urlParams.searchContentType),
            searchTerms: urlParams.searchTerms,
            language: lang,
            displayLanguage: uiLang,
            offset: paginationState.page * paginationState.rowsPerPage,
            limit: paginationState.rowsPerPage,
            fieldSorter: orderBy === '' ? null : {
                sortType: order === '' ? null : (order==="DESC" ? "ASC" : "DESC"),
                fieldName: orderBy === '' ? null : orderBy,
                ignoreCase: true,
            }
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

    getQueryParams(path, paginationState, uiLang, lang, urlParams, rootPath, order, orderBy) {

        let {sql2SearchFrom, sql2SearchWhere} = urlParams;
        let query = `SELECT * FROM [${sql2SearchFrom}] WHERE ISDESCENDANTNODE('${path}')`;
        if (sql2SearchWhere && sql2SearchWhere !== "") {
            query = query + ` AND (${sql2SearchWhere})`;
        }

        return {
            query: query,
            language: lang,
            displayLanguage: uiLang,
            offset: paginationState.page * paginationState.rowsPerPage,
            limit: paginationState.rowsPerPage,
            fieldSorter: orderBy === '' ? null : {
                sortType: order === '' ? null : (order==="DESC" ? "ASC" : "DESC"),
                fieldName: orderBy === '' ? null : orderBy,
                ignoreCase: true,
            }
        };
    }

    getResultsPath(results) {
        return results;
    }
}

const browseType = {
    pages: {recursionTypesFilter: ["jnt:page"], typeFilter: [Constants.contentType]},
    contents: {recursionTypesFilter: ["jnt:contentFolder"], typeFilter: [Constants.contentType]}
};

const nodeFields = gql `
    fragment NodeFields on JCRNode {
        aggregatedPublicationInfo(language: $language) {
            publicationStatus
        }
        name
        displayName(language: $language)
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
        ancestors(fieldFilter: {filters: {fieldName: "deletionDate", evaluation: NOT_EMPTY}}) {
            deletionDate:property(name: "j:deletionDate") {
                value
            }
            deletionUser: property(name: "j:deletionUser") {
                value
            }
        }
        site {
            ...NodeCacheRequiredFields
        }
        ...NodeCacheRequiredFields
    }
    ${PredefinedFragments.nodeCacheRequiredFields.gql}
`;

const getNodeSubTree = gql `
    query getNodeSubTree($path:String!, $language:String!, $offset:Int, $limit:Int, $displayLanguage:String!, $typeFilter:[String]!, $recursionTypesFilter:[String]!,$fieldSorter: InputFieldSorterInput) {
        jcr {
            results: nodeByPath(path: $path) {
                descendants(offset:$offset, limit:$limit, typesFilter: {types: $typeFilter, multi:ANY}, recursionTypesFilter: {multi: NONE, types: $recursionTypesFilter}, fieldSorter: $fieldSorter) {
                    pageInfo {
                        totalCount
                    }
                    nodes {
                        ...NodeFields
                    }
                }
                ...NodeCacheRequiredFields
            }
        }
    }
    ${nodeFields}
`;

const GetNodeAndChildrenByPathQuery = gql `
    query GetNodeByPathQuery($path: String!, $language: String!, $displayLanguage:String!) {
        jcr {
            results: nodeByPath(path: $path) {
                ...NodeFields
                children {
                    nodes {
                        ...NodeFields
                    }
                }
            }
        }
    }
    ${nodeFields}
`;

const searchContentQuery = gql `
    query searchContentQuery($path:String!, $nodeType:String!, $searchTerms:String!, $language:String!, $displayLanguage:String!, $offset:Int, $limit:Int, $fieldSorter: InputFieldSorterInput) {
        jcr {
            results: nodesByCriteria(criteria: {language: $language, nodeType: $nodeType, paths: [$path], nodeConstraint: {contains: $searchTerms}}, offset: $offset, limit: $limit, fieldSorter: $fieldSorter) {
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

const sql2SearchContentQuery = gql `
    query sql2SearchContentQuery($query:String!, $language:String!, $displayLanguage:String!, $offset:Int, $limit:Int, $fieldSorter: InputFieldSorterInput) {
        jcr {
            results: nodesByQuery(query: $query, queryLanguage: SQL2, language: $language, offset: $offset, limit: $limit, fieldSorter: $fieldSorter) {
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
    query Files($path:String!, $language:String!, $offset:Int, $limit:Int, $displayLanguage:String!, $typeFilter:[String]!, $recursionTypesFilter:[String]!, $fieldSorter: InputFieldSorterInput) {
        jcr {
            results: nodeByPath(path: $path) {
                id : uuid
                descendants(offset:$offset, limit:$limit, typesFilter: {types: $typeFilter, multi:ANY}, recursionTypesFilter: {multi: NONE, types: $recursionTypesFilter}, fieldSorter: $fieldSorter) {
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
                ...NodeCacheRequiredFields
            }
        }
    }
    ${nodeFields}
`;

const SiteContentTypesQuery = gql `
    query SiteContentTypesQuery($siteKey: String!, $displayLanguage:String!) {
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

const ContentTypesQuery = gql `
    query ContentTypesQuery($nodeTypes: [String]!) {
        jcr {
            nodeTypesByNames(names: $nodeTypes) {
                name
                supertypes {
                    name
                }
            }
        }
    }
`;

const ContentTypeNamesQuery = gql `
    query ContentTypeNamesQuery($nodeTypes: [String]!, $displayLanguage: String!) {
        jcr {
            nodeTypesByNames(names: $nodeTypes) {
                name,
                displayName(language: $displayLanguage)
            }
        }
    }
`;

const ActionRequirementsQuery = gql `
    query ActionRequirementsQuery($path:String!, $language:String!) {
        jcr {
            nodeByPath(path:$path) {
                aggregatedPublicationInfo(language: $language) {
                    publicationStatus
                }
                ...requirements
                ...NodeCacheRequiredFields
            }
        }
    }
    ${PredefinedFragments.nodeCacheRequiredFields.gql}
`;

const ActionRequirementsFragments = {
    allowedChildNodeTypes: {
        variables: {
            baseChildNodeType: "String!"
        },
        applyFor: "requirements",
        gql: gql `fragment ProvideTypes on JCRNode {
            allowedChildNodeTypes(fieldFilter: {filters: [{fieldName: "supertypes", evaluation: NOT_EMPTY}]}) {
                name
                supertypes(fieldFilter: {filters: [{fieldName: "name", value: $baseChildNodeType}]}) {
                    name
                }
            }
            contributeTypes: property(name: "j:contributeTypes") {
                values
            }
        }`
    },
    requiredChildNodeType: {
        variables: {
            childNodeType: "String!"
        },
        applyFor: "requirements",
        gql: gql `fragment AllowedChildNodeType on JCRNode {
            allowedChildNodeTypes(fieldFilter: {filters: [{fieldName: "name", value: $childNodeType}]}) {
                name
            }
        }`
    },
    retrieveProperties: {
        variables: {
            retrievePropertiesNames: "[String!]!",
            retrievePropertiesLang: "String!"
        },
        applyFor: "requirements",
        gql: gql `fragment NodeProperties on JCRNode {
            properties(names: $retrievePropertiesNames, language: $retrievePropertiesLang) {
                name
                value
                values
            }
        }`
    },
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
    siteInstalledModules: {
        applyFor: "requirements",
        gql: gql `fragment SiteInstalledModules on JCRNode {
            site {
                installedModulesWithAllDependencies
                ...NodeCacheRequiredFields
            }
        }`
    }
};

class ActionRequirementsQueryHandler {

    constructor(path, action, language) {

        this.requirementsFragments = [];
        this.variables = {
            path: path,
            language: language
        };

        if (!_.isEmpty(action.requiredPermission)) {
            this.requirementsFragments.push(ActionRequirementsFragments.permission);
            this.variables.permission = action.requiredPermission;
        }
        if (!_.isEmpty(action.hideOnNodeTypes)) {
            this.requirementsFragments.push(ActionRequirementsFragments.isNotNodeType);
            this.variables.isNotNodeType = {types: action.hideOnNodeTypes};
        }
        if (!_.isEmpty(action.showOnNodeTypes)) {
            this.requirementsFragments.push(ActionRequirementsFragments.isNodeType);
            this.variables.isNodeType = {types: action.showOnNodeTypes};
        }
        if (!_.isEmpty(action.retrieveProperties)) {
            this.requirementsFragments.push(ActionRequirementsFragments.retrieveProperties);
            this.variables = {...action.retrieveProperties, ...this.variables}
        }
        if (!_.isEmpty(action.requireModuleInstalledOnSite)) {
            this.requirementsFragments.push(ActionRequirementsFragments.siteInstalledModules);
        }
        if (!_.isEmpty(action.contentType)) {
            this.requirementsFragments.push(ActionRequirementsFragments.requiredChildNodeType);
            this.variables.childNodeType = action.contentType;
        }
        if (!_.isEmpty(action.baseContentType)) {
            this.requirementsFragments.push(ActionRequirementsFragments.allowedChildNodeTypes);
            this.variables.baseChildNodeType = action.baseContentType;
        }
    }

    getQuery() {
        let requirementsQuery = _.cloneDeep(ActionRequirementsQuery);
        replaceFragmentsInDocument(requirementsQuery, this.requirementsFragments);
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
    SiteContentTypesQuery,
    ContentTypesQuery,
    ContentTypeNamesQuery,
    GetNodeAndChildrenByPathQuery,
    ActionRequirementsQueryHandler,
};
