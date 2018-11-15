import gql from "graphql-tag";
import {PredefinedFragments} from "@jahia/apollo-dx";
import * as _ from 'lodash';
import {replaceFragmentsInDocument} from "@jahia/apollo-dx/index";
import Constants from "./constants";

class BrowsingQueryHandler {

    getQuery() {
        return getNodeSubTree;
    }

    getQueryParams(path, paginationState, uiLang, lang, urlParams, rootPath, order, orderBy, treeState) {
        const type = urlParams.type || (_.startsWith(path, rootPath + "/contents") ? "contents" : "pages");
        return {
            path: path,
            language: lang,
            displayLanguage: uiLang,
            offset: paginationState.page * paginationState.rowsPerPage,
            limit: paginationState.rowsPerPage,
            typeFilter: browseType[treeState][type].typeFilter || "jnt:contentFolder",
            recursionTypesFilter: browseType[treeState][type].recursionTypesFilter || Constants.contentType,
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
    open: {
        pages: {recursionTypesFilter: ["jnt:page"], typeFilter: [Constants.contentType]},
        contents: {recursionTypesFilter: ["jnt:contentFolder"], typeFilter: [Constants.contentType]}
    },
    hidden: {
        pages: {recursionTypesFilter: ["jnt:page"], typeFilter: [Constants.contentType, "jnt:page"]},
        contents: {recursionTypesFilter: ["jnt:contentFolder"], typeFilter: [Constants.contentType, "jnt:contentFolder"]}
    }
};

const PickerItemsFragment = {
    mixinTypes: {
        applyFor: "node",
        variables: {
            lang: "String!"
        },
        gql: gql`
        fragment MixinTypes on JCRNode {
             mixinTypes {
                name
            }
        }`

    },
    primaryNodeType: {
        applyFor: "node",
        gql: gql`fragment PrimaryNodeTypeName on JCRNode { primaryNodeType { name } }`
    },
};

const nodeFields = gql`
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
        mixinTypes {
            name
        }
        lockOwner: property(name: "jcr:lockOwner") {
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

const getNodeSubTree = gql`
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

const GetNodeAndChildrenByPathQuery = gql`
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

const searchContentQuery = gql`
    query searchContentQuery($path:String!, $nodeType:String!, $searchTerms:String!, $language:String!, $displayLanguage:String!, $offset:Int, $limit:Int, $fieldSorter: InputFieldSorterInput) {
        jcr {
            results: nodesByCriteria(criteria: {language: $language, nodeType: $nodeType, paths: [$path], nodeConstraint: {contains: $searchTerms}}, offset: $offset, limit: $limit, fieldSorter: $fieldSorter) {
                pageInfo {
                    totalCount
                }
                nodes {
                    parents:ancestors(fieldFilter: {filters: {fieldName: "type", evaluation: AMONG, values:["jnt:page", "jnt:folder", "jnt:contentFolder"]}}) {
                        type:property(name: "jcr:primaryType") {
                            value
                        }
                        name
                        path
                    }
                    ...NodeFields
                }
            }
        }
    }
    ${nodeFields}
`;

const sql2SearchContentQuery = gql`
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

const previewQuery = gql`query previewQueryAllWorkspaces($path:String!, $templateType: String!, $view: String!, $contextConfiguration: String!, $language: String!, $isPublished: Boolean!) {
    live:jcr(workspace: LIVE) @include(if: $isPublished) {
        nodeByPath(path:$path) {
            id : uuid
            isFile:isNodeType(type: {types: ["jnt:file"]})
            path
            renderedContent(templateType:$templateType, view: $view, contextConfiguration: $contextConfiguration, language: $language) {
                output
                staticAssets(type:"css") {
                    key
                }
            }
            ...NodeCacheRequiredFields
        }
    }
    edit:jcr(workspace: EDIT) {
        nodeByPath(path:$path) {
            id : uuid
            isFile:isNodeType(type: {types: ["jnt:file"]})
            path
            isPublished:property(name:"j:published") {
                name
                value
            }
            renderedContent(templateType:$templateType, view: $view, contextConfiguration: $contextConfiguration, language: $language) {
                output
                staticAssets(type:"css") {
                    key
                }
            }
            ...NodeCacheRequiredFields
        }
    }
  }${PredefinedFragments.nodeCacheRequiredFields.gql}`;

const filesQuery = gql`
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

const SiteContentTypesQuery = gql`
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

const ContentTypesQuery = gql`
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

const ContentTypeNamesQuery = gql`
    query ContentTypeNamesQuery($nodeTypes: [String]!, $displayLanguage: String!) {
        jcr {
            nodeTypesByNames(names: $nodeTypes) {
                name,
                displayName(language: $displayLanguage)
            }
        }
    }
`;

const ActionRequirementsQuery = gql`
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
    displayName: {
        applyFor: "requirements",
        gql:gql`
            fragment DisplayName on JCRNode {
                displayName(language: $language)
            }
        `,
    },   
    primaryNodeType: {
        variables: {
            displayLanguage: "String!"
        },
        applyFor: "requirements",
        gql:gql`
            fragment PrimaryNodeType on JCRNode {
                primaryNodeType {
                    name
                    displayName(language: $displayLanguage)
                    icon
                }
            }
        `,
    },
    allowedChildNodeTypes: {
        variables: {
            baseChildNodeType: "String!"
        },
        applyFor: "requirements",
        gql: gql`fragment ProvideTypes on JCRNode {
            allowedChildNodeTypes(fieldFilter: {filters: [{fieldName: "supertypes", evaluation: NOT_EMPTY}]}) {
                name
                supertypes(fieldFilter: {filters: [{fieldName: "name", value: $baseChildNodeType}]}) {
                    name
                }
            }
        }`
    },
    requiredChildNodeType: {
        variables: {
            childNodeType: "String!"
        },
        applyFor: "requirements",
        gql: gql`fragment AllowedChildNodeType on JCRNode {
            allowedChildNodeTypes(fieldFilter: {filters: [{fieldName: "name", value: $childNodeType}]}) {
                name
            }
        }`
    },
    retrieveProperties: {
        variables: {
            retrievePropertiesNames: "[String!]!",
        },
        applyFor: "requirements",
        gql: gql`fragment NodeProperties on JCRNode {
            properties(names: $retrievePropertiesNames, language: $language) {
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
        gql: gql`fragment NodeIsNodeType on JCRNode {
            isNodeType(type: $isNodeType)
        }`
    },
    isNotNodeType: {
        variables: {
            isNotNodeType: "InputNodeTypesInput!"
        },
        applyFor: "requirements",
        gql: gql`fragment NodeIsNotNodeType on JCRNode {
            isNotNodeType: isNodeType(type: $isNotNodeType)
        }`
    },
    permission: {
        variables: {
            permission: "String!"
        },
        applyFor: "requirements",
        gql: gql`fragment NodeHasPermission on JCRNode {
            hasPermission(permissionName: $permission)
        }`
    },
    siteInstalledModules: {
        applyFor: "requirements",
        gql: gql`fragment SiteInstalledModules on JCRNode {
            site {
                installedModulesWithAllDependencies
                ...NodeCacheRequiredFields
            }
        }`
    },
    siteLanguages: {
        applyFor: "requirements",
        gql: gql`fragment SiteLanguages on JCRNode {
            site {
                defaultLanguage
                ...NodeCacheRequiredFields
                languages {
                    displayName
                    language
                    activeInEdit
                }
            }
        }`
    },
    displayableNodePath: {
        applyFor: "requirements",
        gql: gql`fragment DisplayableNodePath on JCRNode {
            displayableNode {
                path
            }
        }`
    },
    retrieveLockInfo: {
        applyFor: "requirements",
        gql: gql` fragment LockInfo on JCRNode {
            lockOwner: property(name: "jcr:lockOwner") {
                value
            }
            lockTypes: property(name: "j:lockTypes") {
                values
            }
        }`
    },
    retrieveContentRestriction: {
        applyFor: "requirements",
        gql: gql`fragment ContentRestriction on JCRNode {
            contributeTypes: property(name: "j:contributeTypes") {
                values
            }
            ancestors(fieldFilter: {filters: {evaluation: NOT_EMPTY, fieldName: "contributeTypes"}}) {
                contributeTypes : property(name: "j:contributeTypes", language: $language) {
                    values
                }
            }
        }`
    }
};

class ActionRequirementsQueryHandler {

    constructor(context) {

        this.requirementsFragments = [];
        this.variables = {
            path: context.path,
            language: context.language,
            displayLanguage: context.uiLang
        };

        //todo optimize / execute on demand
        this.requirementsFragments.push(ActionRequirementsFragments.displayName);
        this.requirementsFragments.push(ActionRequirementsFragments.primaryNodeType);

        if (!_.isEmpty(context.requiredPermission)) {
            this.requirementsFragments.push(ActionRequirementsFragments.permission);
            this.variables.permission = context.requiredPermission;
        }
        if (!_.isEmpty(context.hideOnNodeTypes)) {
            this.requirementsFragments.push(ActionRequirementsFragments.isNotNodeType);
            this.variables.isNotNodeType = {types: context.hideOnNodeTypes};
        }
        if (!_.isEmpty(context.showOnNodeTypes)) {
            this.requirementsFragments.push(ActionRequirementsFragments.isNodeType);
            this.variables.isNodeType = {types: context.showOnNodeTypes};
        }
        if (!_.isEmpty(context.retrieveProperties)) {
            this.requirementsFragments.push(ActionRequirementsFragments.retrieveProperties);
            this.variables = {...context.retrieveProperties, ...this.variables}
        }
        if (!_.isEmpty(context.requireModuleInstalledOnSite)) {
            this.requirementsFragments.push(ActionRequirementsFragments.siteInstalledModules);
        }
        if (!_.isEmpty(context.contentType)) {
            this.requirementsFragments.push(ActionRequirementsFragments.requiredChildNodeType);
            this.variables.childNodeType = context.contentType;
        }
        if (!_.isEmpty(context.baseContentType)) {
            this.requirementsFragments.push(ActionRequirementsFragments.allowedChildNodeTypes);
            this.variables.baseChildNodeType = context.baseContentType;
        }
        if (context.retrieveSiteLanguages) {
            this.requirementsFragments.push(ActionRequirementsFragments.siteLanguages);
        }
        if (context.getDisplayableNodePath) {
            this.requirementsFragments.push(ActionRequirementsFragments.displayableNodePath);
        }
        if(context.getLockInfo){
            this.requirementsFragments.push(ActionRequirementsFragments.retrieveLockInfo);
        }
        if(context.getContributeTypesRestrictions){
            this.requirementsFragments.push(ActionRequirementsFragments.retrieveContentRestriction);
        }
    }

    getQuery() {
        return replaceFragmentsInDocument(ActionRequirementsQuery, this.requirementsFragments);
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
    PickerItemsFragment,
    previewQuery,
};
