import * as shared from './index';

jest.mock('@jahia/ui-extender', () => ({registry: {get: jest.fn(), add: jest.fn(), addOrReplace: jest.fn(), find: jest.fn(() => [])}}));

describe('the filter API of @jahia/jcontent', () => {
    it('exports the filter bar, the hooks, the constraint builder and the kinds', () => {
        expect(typeof shared.FilterBar).toBe('function');
        expect(typeof shared.useFilters).toBe('function');
        expect(typeof shared.useFilterFields).toBe('function');
        expect(typeof shared.filtersToNodeConstraint).toBe('function');
        expect(Object.values(shared.FILTER_KINDS)).toEqual(['text', 'number', 'date', 'boolean', 'choice', 'media']);
        expect(Object.keys(shared.FILTER_OPERATORS)).toEqual(Object.values(shared.FILTER_KINDS));
    });

    it('case 3: puts the constraint of the module first', () => {
        const fields = [{key: 'prop:price', label: 'Price', kind: 'number', property: 'price'}];
        const search = {contains: 'provence'};
        expect(shared.filtersToNodeConstraint([{field: 'prop:price', operator: 'gt', value: '500000'}], fields, search))
            .toEqual({all: [search, {property: 'price', gt: '500000'}]});
    });

    it('case 5: builds the constraint of a field of the module', () => {
        const fields = [{key: 'prop:price', kind: 'number', property: 'price', label: 'Price'}];
        expect(shared.filtersToNodeConstraint([{field: 'prop:price', operator: 'gt', value: '100'}], fields))
            .toEqual({property: 'price', gt: '100'});
    });
});
