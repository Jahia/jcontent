import gql from 'graphql-tag';
import {PredefinedFragments} from '@jahia/data-helper';
import * as _ from 'lodash';
import JContentConstants from '../../JContent.constants';

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
            path
        }
        ...NodeCacheRequiredFields
    }
    ${PredefinedFragments.nodeCacheRequiredFields.gql}
`;

class ContentQueryHandler {
    getQuery() {
        return gql`
            query getNodeSubTree($path:String!, $language:String!, $offset:Int, $limit:Int, $displayLanguage:String!, $typeFilter:[String]!, $recursionTypesFilter: InputNodeTypesInput, $fieldSorter: InputFieldSorterInput, $fieldGrouping: InputFieldGroupingInput) {
                jcr {
                    nodeByPath(path: $path) {
                        ...NodeFields
                        descendants(offset:$offset, limit:$limit, typesFilter: {types: $typeFilter, multi: ANY}, recursionTypesFilter: $recursionTypesFilter, fieldSorter: $fieldSorter, fieldGrouping: $fieldGrouping) {
                            pageInfo {
                                totalCount
                            }
                            nodes {
                                ...NodeFields
                                ...ChildNodesCount
                            }
                        }
                    }
                }
            }
            ${nodeFields}
            ${childNodesCount}
        `;
    }

    getQueryParams(path, uilang, lang, urlParams, rootPath, pagination, sort) {
        let type = urlParams.type || (_.startsWith(path, rootPath + '/contents') ? 'contents' : 'pages');
        if (urlParams.sub) {
            type = 'contents';
        }

        const paramsByBrowseType = {
            pages: {
                typeFilter: [JContentConstants.contentType, 'jnt:page'],
                recursionTypesFilter: {multi: 'NONE', types: ['jnt:page', 'jnt:contentFolder']}
            },
            contents: {
                typeFilter: ['jnt:content', 'jnt:contentFolder'],
                recursionTypesFilter: {multi: 'NONE', types: ['nt:base']}
            }
        };

        return {
            path: path,
            language: lang,
            displayLanguage: uilang,
            offset: pagination.currentPage * pagination.pageSize,
            limit: pagination.pageSize,
            typeFilter: paramsByBrowseType[type].typeFilter,
            recursionTypesFilter: paramsByBrowseType[type].recursionTypesFilter,
            fieldSorter: sort.orderBy === '' ? null : {
                sortType: sort.order === '' ? null : (sort.order === 'DESC' ? 'ASC' : 'DESC'),
                fieldName: sort.orderBy === '' ? null : sort.orderBy,
                ignoreCase: true
            },
            fieldGrouping: {
                fieldName: 'primaryNodeType.name',
                groups: paramsByBrowseType[type].recursionTypesFilter,
                groupingType: 'START'
            }
        };
    }

    updateQueryParamsForStructuredView(params, viewType, mode) {
        const p = {
            ...params,
            fieldGrouping: null,
            offset: 0,
            limit: 10000
        };

        const {CONTENT, PAGES} = JContentConstants.tableView.viewType;
        switch (viewType) {
            case CONTENT: return {
                ...p,
                recursionTypesFilter: JContentConstants.mode.CONTENT_FOLDERS === mode ? {multi: 'NONE', types: ['jnt:contentFolder']} : {types: ['jnt:content']},
                typeFilter: ['jnt:content']
            };
            case PAGES: return {
                ...p,
                recursionTypesFilter: {types: ['jnt:page']},
                typeFilter: ['jnt:page']
            };

            default: return p;
        }
    }

    getResultsPath(data) {
        return data && data.jcr && data.jcr.nodeByPath && data.jcr.nodeByPath.descendants;
    }
}

class FilesQueryHandler {
    getQuery() {
        return gql`
            query getFiles($path:String!, $language:String!, $offset:Int, $limit:Int, $displayLanguage:String!, $typeFilter:[String]!, $fieldSorter: InputFieldSorterInput, $fieldGrouping: InputFieldGroupingInput) {
                jcr {
                    nodeByPath(path: $path) {
                        ...NodeFields
                        children(offset: $offset, limit: $limit, typesFilter: {types: $typeFilter, multi: ANY}, fieldSorter: $fieldSorter, fieldGrouping: $fieldGrouping) {
                            pageInfo {
                                totalCount
                            }
                            nodes {
                                ...NodeFields
                                ...ChildNodesCount
                                width: property(name: "j:width") {
                                    value
                                }
                                height: property(name: "j:height") {
                                    value
                                }
                                children(typesFilter: {types: ["jnt:resource"]}) {
                                    nodes {
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
        `;
    }

    getQueryParams(path, uilang, lang, urlParams, rootPath, pagination, sort) {
        return {
            path: path,
            language: lang,
            displayLanguage: uilang,
            offset: pagination.currentPage * pagination.pageSize,
            limit: pagination.pageSize,
            typeFilter: ['jnt:file', 'jnt:folder'],
            fieldSorter: sort.orderBy === '' ? null : {
                sortType: sort.order === '' ? null : (sort.order === 'DESC' ? 'ASC' : 'DESC'),
                fieldName: sort.orderBy === '' ? null : sort.orderBy,
                ignoreCase: true
            },
            fieldGrouping: {
                fieldName: 'primaryNodeType.name',
                groups: ['jnt:folder'],
                groupingType: 'START'
            }
        };
    }

    updateQueryParamsForStructuredView(params) {
        return params;
    }

    getResultsPath(data) {
        return data && data.jcr && data.jcr.nodeByPath && data.jcr.nodeByPath.children;
    }
}

class SearchQueryHandler {
    getQuery() {
        return gql`
            query searchContentQuery($searchPath:String!, $nodeType:String!, $searchTerms:String!, $language:String!, $displayLanguage:String!, $offset:Int, $limit:Int, $fieldSorter: InputFieldSorterInput) {
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
                                    {contains: $searchTerms, property: "j:nodename"}
                                ]
                            }
                        },
                        offset: $offset,
                        limit: $limit,
                        fieldSorter: $fieldSorter
                    ) {
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
    }

    getQueryParams(path, uilang, lang, urlParams, rootPath, pagination, sort) {
        return {
            searchPath: urlParams.searchPath,
            nodeType: (urlParams.searchContentType || 'jmix:searchable'),
            searchTerms: urlParams.searchTerms,
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
    }

    updateQueryParamsForStructuredView(params) {
        return params;
    }

    getResultsPath(data) {
        return data && data.jcr && data.jcr.nodesByCriteria;
    }
}

class Sql2SearchQueryHandler {
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
                        }
                    }
                }
            }
            ${nodeFields}
        `;
    }

    getQueryParams(path, uilang, lang, urlParams, rootPath, pagination, sort) {
        let {sql2SearchFrom, sql2SearchWhere} = urlParams;
        let query = `SELECT * FROM [${sql2SearchFrom}] WHERE ISDESCENDANTNODE('${urlParams.searchPath}')`;
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
    }

    updateQueryParamsForStructuredView(params) {
        return params;
    }

    getResultsPath(data) {
        return data && data.jcr && data.jcr.nodesByQuery;
    }
}

export {
    ContentQueryHandler,
    SearchQueryHandler,
    Sql2SearchQueryHandler,
    FilesQueryHandler,
    mixinTypes
};
