import gql from 'graphql-tag';
import {PredefinedFragments} from '@jahia/apollo-dx';
import * as _ from 'lodash';
import ContentManagerConstants from '../../ContentManager.constants';

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
        subNodes: children(typesFilter:{types:["jnt:content"]}) {
            pageInfo {
                totalCount
            }
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
        ...NodeCacheRequiredFields
    }
    ${PredefinedFragments.nodeCacheRequiredFields.gql}
`;

class ContentQueryHandler {
    getQuery() {
        return gql`
            query getNodeSubTree($path:String!, $language:String!, $offset:Int, $limit:Int, $displayLanguage:String!, $typeFilter:[String]!, $recursionTypesFilter:[String]!, $fieldSorter: InputFieldSorterInput, $fieldGrouping: InputFieldGroupingInput) {
                jcr {
                    results: nodeByPath(path: $path) {
                        descendants(offset:$offset, limit:$limit, typesFilter: {types: $typeFilter, multi: ANY}, recursionTypesFilter: {multi: NONE, types: $recursionTypesFilter}, fieldSorter: $fieldSorter, fieldGrouping: $fieldGrouping) {
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
    }

    getQueryParams(path, uiLang, lang, urlParams, rootPath, pagination, sort) {
        const type = urlParams.type || (_.startsWith(path, rootPath + '/contents') ? 'contents' : 'pages');
        let baseTypeFilter = urlParams.sub ? 'jnt:content' : ContentManagerConstants.contentType;

        const paramsByBrowseType = {
            pages: {
                recursionTypesFilter: ['jnt:page'],
                typeFilter: [baseTypeFilter, 'jnt:content', 'jnt:page']
            },
            contents: {
                recursionTypesFilter: ['nt:base'],
                typeFilter: [baseTypeFilter, 'jnt:content', 'jnt:contentFolder']
            }
        };

        return {
            path: path,
            language: lang,
            displayLanguage: uiLang,
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

    getResultsPath(results) {
        return results.descendants;
    }
}

class FilesQueryHandler {
    getQuery() {
        return gql`
            query getFiles($path:String!, $language:String!, $offset:Int, $limit:Int, $displayLanguage:String!, $typeFilter:[String]!, $fieldSorter: InputFieldSorterInput, $fieldGrouping: InputFieldGroupingInput) {
                jcr {
                    results: nodeByPath(path: $path) {
                        uuid
                        workspace
                        children(offset: $offset, limit: $limit, typesFilter: {types: $typeFilter, multi: ANY}, fieldSorter: $fieldSorter, fieldGrouping: $fieldGrouping) {
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
    }

    getQueryParams(path, uiLang, lang, urlParams, rootPath, pagination, sort) {
        return {
            path: path,
            language: lang,
            displayLanguage: uiLang,
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

    getResultsPath(results) {
        return results.children;
    }
}

class SearchQueryHandler {
    getQuery() {
        return gql`
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
    }

    getQueryParams(path, uiLang, lang, urlParams, rootPath, pagination, sort) {
        return {
            path: path,
            nodeType: (urlParams.searchContentType || 'jmix:searchable'),
            searchTerms: urlParams.searchTerms,
            language: lang,
            displayLanguage: uiLang,
            offset: pagination.currentPage * pagination.pageSize,
            limit: pagination.pageSize,
            fieldSorter: sort.orderBy === '' ? null : {
                sortType: sort.order === '' ? null : (sort.order === 'DESC' ? 'ASC' : 'DESC'),
                fieldName: sort.orderBy === '' ? null : sort.orderBy,
                ignoreCase: true
            }
        };
    }

    getResultsPath(results) {
        return results;
    }
}

class Sql2SearchQueryHandler {
    getQuery() {
        return gql`
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
    }

    getQueryParams(path, uiLang, lang, urlParams, rootPath, pagination, sort) {
        let {sql2SearchFrom, sql2SearchWhere} = urlParams;
        let query = `SELECT * FROM [${sql2SearchFrom}] WHERE ISDESCENDANTNODE('${path}')`;
        if (sql2SearchWhere && sql2SearchWhere !== '') {
            query += ` AND (${sql2SearchWhere})`;
        }

        return {
            query: query,
            language: lang,
            displayLanguage: uiLang,
            offset: pagination.currentPage * pagination.pageSize,
            limit: pagination.pageSize,
            fieldSorter: sort.orderBy === '' ? null : {
                sortType: sort.order === '' ? null : (sort.order === 'DESC' ? 'ASC' : 'DESC'),
                fieldName: sort.orderBy === '' ? null : sort.orderBy,
                ignoreCase: true
            }
        };
    }

    getResultsPath(results) {
        return results;
    }
}

export {
    ContentQueryHandler,
    SearchQueryHandler,
    Sql2SearchQueryHandler,
    FilesQueryHandler
};
