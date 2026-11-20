import {
    FILTER_OPERATORS,
    MULTI_VALUE_OPERATORS,
    VALUELESS_OPERATORS,
    defaultOperator,
    filterToConstraint,
    filtersToNodeConstraint,
    isActiveFilter,
    operatorLabelKeys,
    valuesOf
} from './filterConstraint';
import type {FilterField, FilterKind} from './filters.types';

const title: FilterField = {key: 'prop:jcr:title', label: 'Title', kind: 'text', property: 'jcr:title'};
const price: FilterField = {key: 'prop:price', label: 'Price', kind: 'number', property: 'price'};
const lastModified: FilterField = {key: 'std:lastModified', label: 'Last modified', kind: 'date', property: 'jcr:lastModified'};
const options: FilterField = {key: 'prop:options', label: 'Options', kind: 'choice', property: 'options', multiple: true};
const featured: FilterField = {key: 'prop:featured', label: 'Featured', kind: 'boolean', property: 'featured'};
const photo: FilterField = {key: 'prop:photo', label: 'Photo', kind: 'media', property: 'photo'};
const systemName: FilterField = {key: 'std:systemName', label: 'System name', kind: 'text', property: 'j:nodename', looseSeparators: true};
const fields = [title, price, lastModified, options, featured, photo, systemName];

const fieldOfKind = (kind: FilterKind): FilterField => ({key: `prop:${kind}`, label: kind, kind, property: 'p'});

describe('filter operators', () => {
    it('offers at least one operator for each kind, and builds a constraint for each of them', () => {
        Object.entries(FILTER_OPERATORS).forEach(([kind, operators]) => {
            expect(operators.length).toBeGreaterThan(0);
            operators.forEach(operator => {
                let value: string | string[] = '1';
                if (MULTI_VALUE_OPERATORS.has(operator)) {
                    value = ['x'];
                } else if (kind === 'date' && operator !== 'lastDays') {
                    value = '2026-11-01';
                }

                expect(filterToConstraint(fieldOfKind(kind as FilterKind), {field: `prop:${kind}`, operator, value})).not.toBeNull();
            });
        });
    });

    it('starts text on contains and every other kind on its first operator', () => {
        expect(defaultOperator('text')).toBe('contains');
        expect(defaultOperator('number')).toBe('equals');
        expect(defaultOperator('date')).toBe('after');
        expect(defaultOperator('boolean')).toBe('isTrue');
        expect(defaultOperator('choice')).toBe('is');
        expect(defaultOperator('media')).toBe('notEmpty');
    });

    it('does not offer gte and lte', () => {
        Object.values(FILTER_OPERATORS).forEach(operators => {
            expect(operators).not.toContain('gte');
            expect(operators).not.toContain('lte');
        });
    });

    it('builds a constraint with no value for each valueless operator', () => {
        VALUELESS_OPERATORS.forEach(operator => {
            const field = Object.values(FILTER_OPERATORS).some(list => list.includes(operator)) ?
                fields.find(candidate => FILTER_OPERATORS[candidate.kind].includes(operator)) :
                undefined;
            expect(filterToConstraint(field, {field: field.key, operator})).not.toBeNull();
        });
    });
});

describe('valuesOf', () => {
    it('takes a list or a bare value, and drops empty entries', () => {
        expect(valuesOf(['garage', 'pool'])).toEqual(['garage', 'pool']);
        expect(valuesOf('garage')).toEqual(['garage']);
        expect(valuesOf([' garage ', '', null, undefined])).toEqual(['garage']);
        expect(valuesOf(undefined)).toEqual([]);
    });
});

describe('filterToConstraint', () => {
    it('case 1: one text filter, lower case', () => {
        expect(filterToConstraint(title, {field: title.key, operator: 'contains', value: 'News'}))
            .toEqual({property: 'jcr:title', like: '%news%', function: 'LOWER_CASE'});
    });

    it('anchors startsWith at the start', () => {
        expect(filterToConstraint(title, {field: title.key, operator: 'startsWith', value: 'Villa'}))
            .toEqual({property: 'jcr:title', like: 'villa%', function: 'LOWER_CASE'});
    });

    it('case 2: escapes the wildcards of LIKE', () => {
        expect(filterToConstraint(title, {field: title.key, operator: 'contains', value: '50%_off'}).like).toBe('%50\\%\\_off%');
        expect(filterToConstraint(title, {field: title.key, operator: 'contains', value: 'a\\b'}).like).toBe('%a\\\\b%');
    });

    it('gives notContains an arm that keeps the items with a non-blank value', () => {
        expect(filterToConstraint(title, {field: title.key, operator: 'notContains', value: 'Garage'})).toEqual({
            all: [
                {property: 'jcr:title', like: '_%', function: 'LOWER_CASE'},
                {none: [{property: 'jcr:title', like: '%garage%', function: 'LOWER_CASE'}]}
            ]
        });
    });

    it('builds equals on text as is', () => {
        expect(filterToConstraint(title, {field: title.key, operator: 'equals', value: 'Grand Villa'}))
            .toEqual({property: 'jcr:title', equals: 'Grand Villa'});
    });

    it('matches a space against any separator on a field with loose separators', () => {
        expect(filterToConstraint(systemName, {field: systemName.key, operator: 'contains', value: 'Highlight Numbers'}).like)
            .toBe('%highlight%numbers%');
        expect(filterToConstraint(systemName, {field: systemName.key, operator: 'startsWith', value: 'Highlight  Numbers'}).like)
            .toBe('highlight%numbers%');
        expect(filterToConstraint(title, {field: title.key, operator: 'contains', value: 'Grand Villa'}).like).toBe('%grand villa%');
    });

    it('compares numbers', () => {
        expect(filterToConstraint(price, {field: price.key, operator: 'gt', value: '10'})).toEqual({property: 'price', gt: '10'});
        expect(filterToConstraint(price, {field: price.key, operator: 'lt', value: '10'})).toEqual({property: 'price', lt: '10'});
        expect(filterToConstraint(price, {field: price.key, operator: 'equals', value: '0'})).toEqual({property: 'price', equals: '0'});
        expect(filterToConstraint(price, {field: price.key, operator: 'notEquals', value: '0'})).toEqual({property: 'price', notEquals: '0'});
    });

    it('refuses a number field value that is not a number', () => {
        expect(filterToConstraint(price, {field: price.key, operator: 'gt', value: 'abc'})).toBeNull();
        expect(filterToConstraint(price, {field: price.key, operator: 'equals', value: 'abc'})).toBeNull();
    });

    it('builds the boolean and presence operators', () => {
        expect(filterToConstraint(featured, {field: featured.key, operator: 'isTrue'})).toEqual({property: 'featured', equals: 'true'});
        expect(filterToConstraint(featured, {field: featured.key, operator: 'isFalse'})).toEqual({property: 'featured', equals: 'false'});
        expect(filterToConstraint(featured, {field: featured.key, operator: 'empty'})).toEqual({property: 'featured', exists: false});
        expect(filterToConstraint(photo, {field: photo.key, operator: 'notEmpty'})).toEqual({property: 'photo', exists: true});
        expect(filterToConstraint(photo, {field: photo.key, operator: 'empty'})).toEqual({property: 'photo', exists: false});
    });

    it('case 5: several values combine with any, one value is a bare equals', () => {
        expect(filterToConstraint(options, {field: options.key, operator: 'is', value: ['garage', 'pool']})).toEqual({
            any: [{property: 'options', equals: 'garage'}, {property: 'options', equals: 'pool'}]
        });
        expect(filterToConstraint(options, {field: options.key, operator: 'is', value: ['garage']}))
            .toEqual({property: 'options', equals: 'garage'});
        expect(filterToConstraint(options, {field: options.key, operator: 'is', value: 'garage'}))
            .toEqual({property: 'options', equals: 'garage'});
    });

    it('case 6: negates a value with no notEquals', () => {
        const constraint = filterToConstraint(options, {field: options.key, operator: 'isNot', value: ['garage']});
        expect(constraint).toEqual({
            any: [
                {property: 'options', exists: false},
                {all: [{property: 'options', exists: true}, {none: [{property: 'options', equals: 'garage'}]}]}
            ]
        });
        expect(JSON.stringify(constraint)).not.toContain('notEquals');
    });

    it('returns no constraint for an empty list of values', () => {
        expect(filterToConstraint(options, {field: options.key, operator: 'is', value: []})).toBeNull();
        expect(filterToConstraint(options, {field: options.key, operator: 'isNot', value: ['  ']})).toBeNull();
    });

    describe('dates', () => {
        const timeZone = process.env.TZ;

        afterEach(() => {
            process.env.TZ = timeZone;
        });

        // Node on Windows ignores a change of TZ at runtime, so the Paris cases run where the change applies
        const inParis = () => {
            process.env.TZ = 'Europe/Paris';
            return new Date(2026, 10, 1).getTimezoneOffset() === -60;
        };

        it('builds the bounds at the start and the end of the day in the local time zone', () => {
            const after = filterToConstraint(lastModified, {field: lastModified.key, operator: 'after', value: '2026-11-01'}).gt;
            const before = filterToConstraint(lastModified, {field: lastModified.key, operator: 'before', value: '2026-11-01'}).lt;
            expect(new Date(after).getTime()).toBe(new Date(2026, 10, 1, 0, 0, 0, 0).getTime());
            expect(new Date(before).getTime()).toBe(new Date(2026, 10, 1, 23, 59, 59, 999).getTime());
            expect(after).toMatch(/^2026-11-01T00:00:00\.000[+-]\d{2}:\d{2}$/);
        });

        it('case 7: builds the start of the day in Europe/Paris, with its offset', () => {
            if (!inParis()) {
                return;
            }

            expect(filterToConstraint(lastModified, {field: lastModified.key, operator: 'after', value: '2026-11-01'}))
                .toEqual({property: 'jcr:lastModified', gt: '2026-11-01T00:00:00.000+01:00'});
            expect(filterToConstraint(lastModified, {field: lastModified.key, operator: 'before', value: '2026-07-01'}))
                .toEqual({property: 'jcr:lastModified', lt: '2026-07-01T23:59:59.999+02:00'});
        });

        it('puts an item modified at 00:30 in Paris on its own day, not on the UTC day', () => {
            if (!inParis()) {
                return;
            }

            const bound = filterToConstraint(lastModified, {field: lastModified.key, operator: 'after', value: '2026-11-01'}).gt;
            const modified = new Date('2026-10-31T23:30:00.000Z');
            expect(modified.getTime()).toBeGreaterThan(new Date(bound).getTime());
        });

        it('refuses a day that is not a day', () => {
            expect(filterToConstraint(lastModified, {field: lastModified.key, operator: 'after', value: '2026-13-45'})).toBeNull();
            expect(filterToConstraint(lastModified, {field: lastModified.key, operator: 'before', value: 'yesterday'})).toBeNull();
        });

        it('sends lastDays as a number of days', () => {
            expect(filterToConstraint(lastModified, {field: lastModified.key, operator: 'lastDays', value: '7'}))
                .toEqual({property: 'jcr:lastModified', lastDays: 7});
        });

        it('case 10: refuses an invalid number of days', () => {
            expect(filterToConstraint(lastModified, {field: lastModified.key, operator: 'lastDays', value: 'abc'})).toBeNull();
            expect(filterToConstraint(lastModified, {field: lastModified.key, operator: 'lastDays', value: '-3'})).toBeNull();
        });
    });

    it('case 8: returns no constraint for a filter with no value', () => {
        expect(filterToConstraint(title, {field: title.key, operator: 'contains', value: ''})).toBeNull();
        expect(filterToConstraint(title, {field: title.key, operator: 'contains', value: '   '})).toBeNull();
        expect(filterToConstraint(title, {field: title.key, operator: 'contains'})).toBeNull();
    });

    it('case 9: ignores an operator that the kind does not offer', () => {
        expect(filterToConstraint(title, {field: title.key, operator: 'gt', value: '1'})).toBeNull();
        expect(filterToConstraint(title, {field: title.key, operator: 'gte', value: '1'})).toBeNull();
        expect(filterToConstraint(price, {field: price.key, operator: 'shoutsAt', value: '1'})).toBeNull();
        expect(filterToConstraint(title, {field: title.key, operator: 'toString', value: '1'})).toBeNull();
    });

    it('needs a field with a property', () => {
        expect(filterToConstraint(undefined, {field: 'x', operator: 'contains', value: 'x'})).toBeNull();
        expect(filterToConstraint({...title, property: ''}, {field: title.key, operator: 'contains', value: 'x'})).toBeNull();
        expect(filterToConstraint(title, undefined)).toBeNull();
    });
});

describe('filtersToNodeConstraint', () => {
    it('returns null when no filter applies', () => {
        expect(filtersToNodeConstraint([], fields)).toBeNull();
        expect(filtersToNodeConstraint(undefined, fields)).toBeNull();
        expect(filtersToNodeConstraint([{field: title.key, operator: 'contains', value: ''}], fields)).toBeNull();
    });

    it('keeps one constraint as it is', () => {
        expect(filtersToNodeConstraint([{field: title.key, operator: 'contains', value: 'villa'}], fields))
            .toEqual({property: 'jcr:title', like: '%villa%', function: 'LOWER_CASE'});
    });

    it('case 3: combines several filters with all', () => {
        expect(filtersToNodeConstraint([
            {field: title.key, operator: 'contains', value: 'news'},
            {field: price.key, operator: 'gt', value: '10'}
        ], fields)).toEqual({
            all: [
                {property: 'jcr:title', like: '%news%', function: 'LOWER_CASE'},
                {property: 'price', gt: '10'}
            ]
        });
    });

    it('case 4: puts the constraint of the view first in the same all', () => {
        const search = {any: [{contains: 'villa'}]};
        const constraint = filtersToNodeConstraint([{field: options.key, operator: 'is', value: ['garage']}], fields, search);
        expect(constraint.all[0]).toBe(search);
        expect(constraint.all[1]).toEqual({property: 'options', equals: 'garage'});
        expect(filtersToNodeConstraint([], fields, search)).toBe(search);
    });

    it('case 9: ignores a filter on a field that is not in the list', () => {
        expect(filtersToNodeConstraint([{field: 'prop:gone', operator: 'contains', value: 'x'}], fields)).toBeNull();
        expect(filtersToNodeConstraint([{field: 'prop:jcr:title', operator: 'contains', value: 'x'}], [])).toBeNull();
    });

    it('ignores a list that is not a list and entries that are not filters', () => {
        expect(filtersToNodeConstraint('broken' as never, fields)).toBeNull();
        expect(filtersToNodeConstraint([null, 3, {field: title.key, operator: 'contains', value: 'x'}] as never, fields))
            .toEqual({property: 'jcr:title', like: '%x%', function: 'LOWER_CASE'});
    });
});

describe('isActiveFilter', () => {
    it('is true only for a filter that gives a constraint', () => {
        expect(isActiveFilter({field: title.key, operator: 'contains', value: 'x'}, fields)).toBe(true);
        expect(isActiveFilter({field: title.key, operator: 'contains', value: ''}, fields)).toBe(false);
        expect(isActiveFilter({field: 'prop:gone', operator: 'contains', value: 'x'}, fields)).toBe(false);
    });
});

describe('operatorLabelKeys', () => {
    it('asks for the cardinality, then the kind, then the operator', () => {
        expect(operatorLabelKeys(options, 'is')).toEqual([
            'jcontent:label.contentManager.filters.operator.choiceMultiple.is',
            'jcontent:label.contentManager.filters.operator.choice.is',
            'jcontent:label.contentManager.filters.operator.is'
        ]);
    });

    it('leaves out the cardinality on a single-valued field and the kind on an unknown field', () => {
        expect(operatorLabelKeys(price, 'equals')).toEqual([
            'jcontent:label.contentManager.filters.operator.number.equals',
            'jcontent:label.contentManager.filters.operator.equals'
        ]);
        expect(operatorLabelKeys(undefined, 'contains')).toEqual(['jcontent:label.contentManager.filters.operator.contains']);
    });
});
