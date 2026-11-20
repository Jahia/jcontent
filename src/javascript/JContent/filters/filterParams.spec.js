import rison from 'rison';
import {cleanFilter, readFilters, setFilterIn, withFilters} from './filterParams';
import {nextParams} from '~/JContent/redux/JContent.redux';

jest.mock('@jahia/ui-extender', () => ({registry: {get: jest.fn(), add: jest.fn(), find: jest.fn(() => [])}}));

const lastModified = {field: 'std:lastModified', operator: 'after', value: '2026-11-01'};
const createdBy = {field: 'std:createdBy', operator: 'contains', value: 'anna'};

describe('readFilters', () => {
    it('case 1: reads the filters of the params', () => {
        expect(readFilters({filters: [lastModified, createdBy]})).toEqual([lastModified, createdBy]);
    });

    it('case 9: gives no filter when the parameter is not a list', () => {
        expect(readFilters({filters: 'broken'})).toEqual([]);
        expect(readFilters({filters: {field: 'x'}})).toEqual([]);
        expect(readFilters({})).toEqual([]);
        expect(readFilters(undefined)).toEqual([]);
    });

    it('drops the entries that are not filters', () => {
        expect(readFilters({filters: [null, 3, 'x', {field: 'a'}, {operator: 'b'}, {field: 1, operator: 'b'}, createdBy]})).toEqual([createdBy]);
    });

    it('keeps the string values of a list', () => {
        expect(readFilters({filters: [{field: 'prop:options', operator: 'is', value: ['garage', 3, 'pool']}]}))
            .toEqual([{field: 'prop:options', operator: 'is', value: ['garage', 'pool']}]);
    });
});

describe('cleanFilter', () => {
    it('never writes an undefined value, which rison refuses', () => {
        const cleaned = cleanFilter({field: 'std:lastPublished', operator: 'empty', value: undefined});
        expect(cleaned).toEqual({field: 'std:lastPublished', operator: 'empty'});
        expect(Object.keys(cleaned)).not.toContain('value');
        expect(() => rison.encode_uri({filters: [cleaned]})).not.toThrow();
    });

    it('drops an empty value', () => {
        expect(cleanFilter({field: 'a', operator: 'contains', value: ''})).toEqual({field: 'a', operator: 'contains'});
        expect(cleanFilter({field: 'a', operator: 'is', value: []})).toEqual({field: 'a', operator: 'is'});
    });
});

describe('withFilters', () => {
    it('keeps the other params', () => {
        expect(withFilters({searchTerms: 'news', sub: true}, [lastModified])).toEqual({searchTerms: 'news', sub: true, filters: [lastModified]});
    });

    it('removes the key for an empty list', () => {
        expect(withFilters({searchTerms: 'news', filters: [lastModified]}, [])).toEqual({searchTerms: 'news'});
        expect(withFilters(undefined, [])).toEqual({});
    });

    it('round-trips through rison', () => {
        const params = withFilters({}, [lastModified, {field: 'prop:options', operator: 'isNot', value: ['garage']}, {field: 'std:tags', operator: 'empty'}]);
        expect(readFilters(rison.decode(rison.encode_uri(params)))).toEqual(params.filters);
    });
});

describe('setFilterIn', () => {
    it('replaces the filter of the same field', () => {
        expect(setFilterIn([lastModified, createdBy], {...createdBy, value: 'bob'})).toEqual([lastModified, {...createdBy, value: 'bob'}]);
    });

    it('adds a filter of a new field last', () => {
        expect(setFilterIn([lastModified], createdBy)).toEqual([lastModified, createdBy]);
    });
});

describe('the navigation rules of cmGoto', () => {
    const current = {site: 'luxe', mode: 'content-folders', path: '/sites/luxe/contents', params: {filters: [lastModified], sub: false}};

    it('case 4: removes the filters when the path changes', () => {
        expect(nextParams({path: '/sites/luxe/contents/other'}, current)).toEqual({sub: false});
    });

    it('removes the filters when the accordion or the site changes', () => {
        expect(nextParams({mode: 'media'}, current)).toEqual({sub: false});
        expect(nextParams({site: 'digitall'}, current)).toEqual({sub: false});
    });

    it('case 5: gives no filter to a subfolder opened from the list', () => {
        expect(nextParams({path: '/sites/luxe/contents/sub', params: {sub: true}}, current)).toEqual({sub: true});
    });

    it('keeps the filters on a change of the language or of the params alone', () => {
        expect(nextParams({language: 'fr'}, current)).toBe(current.params);
        expect(nextParams({path: current.path}, current)).toBe(current.params);
        expect(nextParams({params: {filters: [createdBy]}}, current)).toEqual({filters: [createdBy]});
    });

    it('keeps the filters that the new params give, even on another path', () => {
        expect(nextParams({path: '/sites/luxe/contents/other', params: {filters: [createdBy]}}, current)).toEqual({filters: [createdBy]});
    });
});
