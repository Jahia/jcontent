import {BULK_VALUE_FIELDS, BULK_VALUE_MODES, canApplyValues, finalValues, heldValues, itemsToWrite, valueFieldItem} from './bulkTagCategorize';

describe('finalValues', () => {
    it('should add without duplicates and keep the order', () => {
        expect(finalValues({mode: BULK_VALUE_MODES.ADD, held: ['sport', 'event'], chosen: ['event', 'news']}))
            .toEqual(['sport', 'event', 'news']);
    });

    it('should replace', () => {
        expect(finalValues({mode: BULK_VALUE_MODES.REPLACE, held: ['sport'], chosen: ['archive', 'archive']}))
            .toEqual(['archive']);
    });

    it('should remove', () => {
        expect(finalValues({mode: BULK_VALUE_MODES.REMOVE, held: ['sport', 'event'], chosen: ['sport']}))
            .toEqual(['event']);
    });
});

describe('itemsToWrite', () => {
    const held = heldValues([
        {path: '/a', property: {values: ['sport']}},
        {path: '/b', property: null}
    ]);

    it('should leave out an item that does not change', () => {
        const items = itemsToWrite({paths: ['/a', '/b'], held, mode: BULK_VALUE_MODES.ADD, chosen: ['sport']});
        expect(items).toEqual([{path: '/b', before: [], values: ['sport']}]);
    });

    it('should write an item whose values are removed', () => {
        const items = itemsToWrite({paths: ['/a', '/b'], held, mode: BULK_VALUE_MODES.REMOVE, chosen: ['sport']});
        expect(items).toEqual([{path: '/a', before: ['sport'], values: []}]);
    });
});

describe('valueFieldItem', () => {
    it('should add the mixin and set the values', () => {
        const built = valueFieldItem({path: '/a', values: ['x']})(2, BULK_VALUE_FIELDS.tag);
        expect(built.selection).toContain('addMixins(mixins: ["jmix:tagged"])');
        expect(built.selection).toContain('setValues(type: $type, values: $values2)');
        expect(built.variables).toEqual({values2: ['x']});
    });

    it('should delete the property when no value is left', () => {
        const built = valueFieldItem({path: '/a', values: []})(0, BULK_VALUE_FIELDS.categorize);
        expect(built.selection).toEqual('mutateProperty(name: $property) { delete }');
    });
});

describe('canApplyValues', () => {
    it('should let replace clear the items and need a value otherwise', () => {
        expect(canApplyValues({mode: BULK_VALUE_MODES.REPLACE, chosen: []})).toBe(true);
        expect(canApplyValues({mode: BULK_VALUE_MODES.ADD, chosen: []})).toBe(false);
        expect(canApplyValues({mode: BULK_VALUE_MODES.REMOVE, chosen: ['x']})).toBe(true);
    });
});
