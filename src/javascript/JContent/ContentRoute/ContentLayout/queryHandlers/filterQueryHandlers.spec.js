import {ContentFoldersQueryHandler} from './ContentFoldersQueryHandler';
import {FilesQueryHandler} from './FilesQueryHandler';
import {PagesQueryHandler} from './PagesQueryHandler';
import {SearchQueryHandler, searchTermsConstraint} from './SearchQueryHandler';
import {Sql2SearchQueryHandler} from './Sql2SearchQueryHandler';
import {BaseCriteriaChildrenQuery, BaseDescendantsQuery} from './BaseQueryHandler.gql-queries';
import {isFilterable, restrictFields} from '~/JContent/filters/useViewFilters';

jest.mock('@jahia/data-helper', () => ({PredefinedFragments: {nodeCacheRequiredFields: {gql: require('graphql-tag').default`fragment NodeCacheRequiredFields on JCRNode { uuid workspace path }`}}}));

const filter = {property: 'jcr:lastModified', gt: '2026-11-01T00:00:00.000+01:00'};
const base = {
    path: '/sites/luxe/contents',
    lang: 'en',
    uilang: 'en',
    pagination: {currentPage: 1, pageSize: 25},
    sort: {orderBy: 'displayName', order: 'DESC'},
    typeFilter: ['jnt:content'],
    tableView: {viewMode: 'flatList', viewType: 'content'}
};

describe('ContentFoldersQueryHandler', () => {
    it('case 2: sends the descendants query with no filter, as before', () => {
        expect(ContentFoldersQueryHandler.getQuery(base)).toBe(BaseDescendantsQuery);
        const variables = ContentFoldersQueryHandler.getQueryVariables(base);
        expect(variables.nodeConstraint).toBeUndefined();
        expect(variables.nodeType).toBeUndefined();
        expect(variables.typeFilter).toEqual(['jnt:content']);
    });

    it('case 1: lists the direct children with nodesByCriteria while a filter is active', () => {
        const options = {...base, nodeConstraint: filter};
        expect(ContentFoldersQueryHandler.getQuery(options)).toBe(BaseCriteriaChildrenQuery);
        const variables = ContentFoldersQueryHandler.getQueryVariables(options);
        expect(variables).toEqual(expect.objectContaining({
            path: '/sites/luxe/contents',
            nodeType: 'jnt:content',
            nodeConstraint: filter,
            offset: 25,
            limit: 25,
            fieldSorter: {sortType: 'DESC', fieldName: 'displayName', ignoreCase: true},
            fieldGrouping: {fieldName: 'primaryNodeType.name', groups: ['jnt:contentFolder'], groupingType: 'START'}
        }));
        const result = {nodes: [{path: 'a'}], pageInfo: {totalCount: 40}};
        expect(ContentFoldersQueryHandler.getResults({jcr: {nodesByCriteria: result}}, options)).toBe(result);
    });

    it('takes filters in the flat list only', () => {
        expect(ContentFoldersQueryHandler.supportsFilters(base)).toBe(true);
        expect(ContentFoldersQueryHandler.supportsFilters({...base, tableView: {viewMode: 'structuredView'}})).toBe(false);
    });
});

describe('FilesQueryHandler', () => {
    const media = {...base, path: '/sites/luxe/files', typeFilter: ['jnt:file', 'jnt:folder']};

    it('sends the children query with no filter', () => {
        expect(FilesQueryHandler.getQuery(media)).not.toBe(BaseCriteriaChildrenQuery);
        expect(FilesQueryHandler.getQueryVariables(media).nodeConstraint).toBeUndefined();
    });

    it('case 5: lists the files only while a filter is active', () => {
        const options = {...media, nodeConstraint: filter};
        expect(FilesQueryHandler.getQuery(options)).toBe(BaseCriteriaChildrenQuery);
        expect(FilesQueryHandler.getQueryVariables(options)).toEqual(expect.objectContaining({nodeType: 'jnt:file', nodeConstraint: filter}));
        const result = {nodes: [], pageInfo: {totalCount: 0}};
        expect(FilesQueryHandler.getResults({jcr: {nodesByCriteria: result}}, options)).toBe(result);
        expect(FilesQueryHandler.supportsFilters(options)).toBe(true);
    });
});

describe('SearchQueryHandler', () => {
    const search = {...base, searchPath: '/sites/luxe', searchTerms: 'News', sort: {orderBy: '', order: ''}};

    it('sends the search constraint in a variable', () => {
        expect(SearchQueryHandler.getQueryVariables(search).nodeConstraint).toEqual({
            any: [
                {contains: 'News'},
                {contains: 'News', property: 'j:tagList'},
                {like: '%news%', property: 'j:nodename', function: 'LOWER_CASE'}
            ]
        });
    });

    it('case 4: combines the search constraint and the filter constraint with all', () => {
        expect(SearchQueryHandler.getQueryVariables({...search, nodeConstraint: filter}).nodeConstraint)
            .toEqual({all: [searchTermsConstraint('News'), filter]});
    });
});

describe('case 8: the views with no filter', () => {
    it('declare no support of filters', () => {
        expect(PagesQueryHandler.supportsFilters).toBeUndefined();
        expect(Sql2SearchQueryHandler.supportsFilters).toBeUndefined();
        expect(isFilterable({queryHandler: PagesQueryHandler, filters: {}}, base)).toBe(false);
        expect(isFilterable({queryHandler: ContentFoldersQueryHandler}, base)).toBe(false);
        expect(isFilterable({queryHandler: ContentFoldersQueryHandler, filters: {}}, base)).toBe(true);
    });
});

describe('restrictFields', () => {
    const fields = [{key: 'std:created'}, {key: 'std:type'}, {key: 'prop:price'}];

    it('keeps every field with no keys, or the given keys', () => {
        expect(restrictFields(fields, {}, {})).toBe(fields);
        expect(restrictFields(fields, {fields: ['std:type']}, {})).toEqual([{key: 'std:type'}]);
        expect(restrictFields(fields, {fields: options => (options.mode === 'media' ? ['std:created'] : [])}, {mode: 'media'}))
            .toEqual([{key: 'std:created'}]);
    });
});
