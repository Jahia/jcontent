import gql from 'graphql-tag';
import {PredefinedFragments} from '@jahia/data-helper';
import JContentConstants from '~/JContent/JContent.constants';

const childNodesCount = gql`
    fragment ChildNodesCount on JCRNode {
        subNodes: children(typesFilter: {types: ["jnt:file", "jnt:folder", "jnt:content", "jnt:contentFolder"], multi: ANY}) {
            pageInfo {
                totalCount
            }
        }
    }
`;

const mixinTypes = gql`
    query mixinTypes($path: String!) {
        jcr {
            nodeByPath(path: $path) {
                mixinTypes {
                    name
                }
            }
        }
    }
`;
const nodeFields = gql`
    fragment NodeFields on JCRNode {
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
        operationsSupport {
            lock
            markForDeletion
            publication
        }
        aggregatedPublicationInfo(language: $language) {
            publicationStatus
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
        notSelectableForPreview: isNodeType(type: {types:["jnt:page", "jnt:folder", "jnt:contentFolder"]})
        site {
            ...NodeCacheRequiredFields
        }
        parent {
            ...NodeCacheRequiredFields
            path
        }
        ...NodeCacheRequiredFields
    }
    ${PredefinedFragments.nodeCacheRequiredFields.gql}
`;

const BaseQueryHandler = {
    getQuery() {
        return gql`
            query getNodeSubTree($path:String!, $language:String!, $offset:Int, $limit:Int, $displayLanguage:String!, $typeFilter:[String]!, $recursionTypesFilter: InputNodeTypesInput, $fieldSorter: InputFieldSorterInput, $fieldGrouping: InputFieldGroupingInput) {
                jcr {
                    nodeByPath(path: $path) {
                        ...NodeFields
                        ...node
                        descendants(offset:$offset, limit:$limit, typesFilter: {types: $typeFilter, multi: ANY}, recursionTypesFilter: $recursionTypesFilter, fieldSorter: $fieldSorter, fieldGrouping: $fieldGrouping) {
                            pageInfo {
                                totalCount
                            }
                            nodes {
                                ...NodeFields
                                ...node
                                ...ChildNodesCount
                            }
                        }
                    }
                }
            }
            ${nodeFields}
            ${childNodesCount}
        `;
    },

    getResultsPath(data) {
        return data && data.jcr && data.jcr.nodeByPath && data.jcr.nodeByPath.descendants;
    },

    getFragments() {
        return [];
    },

    getBaseQueryParams({path, lang, uilang, pagination, typeFilter, recursionTypesFilter, sort}) {
        return {
            path: path,
            language: lang,
            displayLanguage: uilang,
            offset: pagination.currentPage * pagination.pageSize,
            limit: pagination.pageSize,
            typeFilter: typeFilter,
            recursionTypesFilter: recursionTypesFilter,
            fieldSorter: sort.orderBy === '' ? null : {
                sortType: sort.order === '' ? null : (sort.order === 'DESC' ? 'ASC' : 'DESC'),
                fieldName: sort.orderBy === '' ? null : sort.orderBy,
                ignoreCase: true
            },
            fieldGrouping: {
                fieldName: 'primaryNodeType.name',
                groups: recursionTypesFilter,
                groupingType: 'START'
            }
        };
    }
};

const ContentQueryHandlerPages = {
    ...BaseQueryHandler,
    getQueryParams({path, uilang, lang, pagination, sort, viewType, viewMode, params}) {
        let typeFilter = JContentConstants.tableView.viewType.PAGES === viewType ? ['jnt:page'] : [JContentConstants.contentType];
        let recursionTypesFilter = {multi: 'NONE', types: ['jnt:page', 'jnt:contentFolder']};

        if (params.sub) {
            typeFilter = ['jnt:content', 'jnt:contentFolder'];
            recursionTypesFilter = {multi: 'NONE', types: ['nt:base']};
        }

        const layoutQueryParams = this.getBaseQueryParams({path, lang, uilang, pagination, sort, typeFilter, recursionTypesFilter});

        if (viewMode === JContentConstants.tableView.viewMode.STRUCTURED) {
            layoutQueryParams.fieldGrouping = null;
            layoutQueryParams.offset = 0;
            layoutQueryParams.limit = 10000;

            if (viewType === JContentConstants.tableView.viewType.CONTENT) {
                layoutQueryParams.recursionTypesFilter = {types: ['jnt:content']};
                layoutQueryParams.typeFilter = ['jnt:content'];
            } else if (viewType === JContentConstants.tableView.viewType.PAGES) {
                layoutQueryParams.recursionTypesFilter = {types: ['jnt:page']};
                layoutQueryParams.typeFilter = ['jnt:page'];
            }
        }

        return layoutQueryParams;
    }
};

const ContentQueryHandlerContentFolders = {
    ...BaseQueryHandler,
    getQueryParams({path, uilang, lang, pagination, sort, viewMode}) {
        const typeFilter = ['jnt:content', 'jnt:contentFolder'];
        const recursionTypesFilter = {multi: 'NONE', types: ['nt:base']};

        const layoutQueryParams = this.getBaseQueryParams({path, lang, uilang, pagination, sort, typeFilter, recursionTypesFilter});

        if (viewMode === JContentConstants.tableView.viewMode.STRUCTURED) {
            layoutQueryParams.fieldGrouping = null;
            layoutQueryParams.offset = 0;
            layoutQueryParams.limit = 10000;

            layoutQueryParams.recursionTypesFilter = {multi: 'NONE', types: ['jnt:contentFolder']};
            layoutQueryParams.typeFilter = ['jnt:content'];
        }

        return layoutQueryParams;
    }
};

const FilesQueryHandler = {
    ...BaseQueryHandler,
    getQuery() {
        return gql`
            query getFiles($path:String!, $language:String!, $offset:Int, $limit:Int, $displayLanguage:String!, $typeFilter:[String]!, $fieldSorter: InputFieldSorterInput, $fieldGrouping: InputFieldGroupingInput) {
                jcr {
                    nodeByPath(path: $path) {
                        ...NodeFields
                        ...node
                        children(offset: $offset, limit: $limit, typesFilter: {types: $typeFilter, multi: ANY}, fieldSorter: $fieldSorter, fieldGrouping: $fieldGrouping) {
                            pageInfo {
                                totalCount
                            }
                            nodes {
                                ...NodeFields
                                ...node
                                ...ChildNodesCount
                                width: property(name: "j:width") {
                                    value
                                }
                                height: property(name: "j:height") {
                                    value
                                }
                                children(typesFilter: {types: ["jnt:resource"]}) {
                                    nodes {
                                        ...NodeCacheRequiredFields
                                        data: property(name: "jcr:data") {
                                            size
                                        }
                                        mimeType: property(name: "jcr:mimeType") {
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
            ${childNodesCount}
            ${PredefinedFragments.nodeCacheRequiredFields.gql}
        `;
    },

    getQueryParams({path, uilang, lang, pagination, sort}) {
        const typeFilter = ['jnt:file', 'jnt:folder'];
        const recursionTypesFilter = {multi: 'NONE', types: ['nt:base']};

        return this.getBaseQueryParams({path, lang, uilang, pagination, sort, typeFilter, recursionTypesFilter});
    },

    getResultsPath(data) {
        return data && data.jcr && data.jcr.nodeByPath && data.jcr.nodeByPath.children;
    }
};

const SearchQueryHandler = {
    getQuery() {
        return gql`
            query searchContentQuery($searchPath:String!, $nodeType:String!, $searchTerms:String!, $nodeNameSearchTerms:String!, $language:String!, $displayLanguage:String!, $offset:Int, $limit:Int, $fieldFilter: InputFieldFiltersInput, $fieldSorter: InputFieldSorterInput) {
                jcr {
                    nodesByCriteria(
                        criteria: {
                            language: $language,
                            nodeType: $nodeType,
                            paths: [$searchPath],
                            nodeConstraint: {
                                any: [
                                    {contains: $searchTerms}
                                    {contains: $searchTerms, property: "j:tagList"}
                                    {like: $nodeNameSearchTerms, property: "j:nodename"}
                                ]
                            }
                        },
                        fieldFilter: $fieldFilter
                        offset: $offset,
                        limit: $limit,
                        fieldSorter: $fieldSorter
                    ) {
                        pageInfo {
                            totalCount
                        }
                        nodes {
                            ...NodeFields
                            ...node
                        }
                    }
                }
            }
            ${nodeFields}
        `;
    },

    getQueryParams({uilang, lang, params, pagination, sort}) {
        return {
            searchPath: params.searchPath,
            nodeType: (params.searchContentType || 'jmix:searchable'),
            searchTerms: params.searchTerms,
            nodeNameSearchTerms: `%${params.searchTerms}%`,
            language: lang,
            displayLanguage: uilang,
            offset: pagination.currentPage * pagination.pageSize,
            limit: pagination.pageSize,
            fieldSorter: sort.orderBy === '' ? null : {
                sortType: sort.order === '' ? null : (sort.order === 'DESC' ? 'ASC' : 'DESC'),
                fieldName: sort.orderBy === '' ? null : sort.orderBy,
                ignoreCase: true
            },
            fieldFilter: {
                filters: [],
                multi: 'NONE'
            }
        };
    },

    getResultsPath(data) {
        return data && data.jcr && data.jcr.nodesByCriteria;
    }
};

const Sql2SearchQueryHandler = {
    getQuery() {
        return gql`
            query sql2SearchContentQuery($query:String!, $language:String!, $displayLanguage:String!, $offset:Int, $limit:Int, $fieldSorter: InputFieldSorterInput) {
                jcr {
                    nodesByQuery(query: $query, queryLanguage: SQL2, language: $language, offset: $offset, limit: $limit, fieldSorter: $fieldSorter) {
                        pageInfo {
                            totalCount
                        }
                        nodes {
                            ...NodeFields
                            ...node
                        }
                    }
                }
            }
            ${nodeFields}
        `;
    },

    getQueryParams({uilang, lang, params, pagination, sort}) {
        let {sql2SearchFrom, sql2SearchWhere} = params;
        let query = `SELECT * FROM [${sql2SearchFrom}] WHERE ISDESCENDANTNODE('${params.searchPath}')`;
        if (sql2SearchWhere && sql2SearchWhere !== '') {
            query += ` AND (${sql2SearchWhere})`;
        }

        return {
            query: query,
            language: lang,
            displayLanguage: uilang,
            offset: pagination.currentPage * pagination.pageSize,
            limit: pagination.pageSize,
            fieldSorter: sort.orderBy === '' ? null : {
                sortType: sort.order === '' ? null : (sort.order === 'DESC' ? 'ASC' : 'DESC'),
                fieldName: sort.orderBy === '' ? null : sort.orderBy,
                ignoreCase: true
            }
        };
    },

    getResultsPath(data) {
        return data && data.jcr && data.jcr.nodesByQuery;
    }
};

export {
    ContentQueryHandlerPages,
    ContentQueryHandlerContentFolders,
    SearchQueryHandler,
    Sql2SearchQueryHandler,
    FilesQueryHandler,
    mixinTypes
};
