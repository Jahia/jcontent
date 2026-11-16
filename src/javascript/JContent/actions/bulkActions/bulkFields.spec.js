import {canSave, commonFields, EDITOR_KINDS, isBulkEditable, isExportable, replaceValueItem, toStoredValue} from './bulkFields';

const property = (name, extra = {}) => ({
    name,
    displayName: name.toUpperCase(),
    requiredType: 'STRING',
    multiple: false,
    internationalized: false,
    mandatory: false,
    hidden: false,
    protected: false,
    constraints: [],
    ...extra
});

const node = (type, properties) => ({path: `/sites/test/${type}`, primaryNodeType: {name: type, properties}});

describe('isBulkEditable', () => {
    it('should keep a plain property', () => {
        expect(isBulkEditable(property('author'))).toBe(true);
    });

    it.each([
        ['hidden', property('author', {hidden: true})],
        ['protected', property('author', {protected: true})],
        ['system', property('jcr:title')],
        ['jahia', property('j:tagList')],
        ['wildcard', property('*')],
        ['reference', property('image', {requiredType: 'WEAKREFERENCE'})],
        ['binary', property('data', {requiredType: 'BINARY'})]
    ])('should drop a %s property', (_, definition) => {
        expect(isBulkEditable(definition)).toBe(false);
    });
});

describe('isExportable', () => {
    it('should keep jcr:title and references, and drop protected and jahia properties', () => {
        expect(isExportable(property('jcr:title'))).toBe(true);
        expect(isExportable(property('image', {requiredType: 'WEAKREFERENCE'}))).toBe(true);
        expect(isExportable(property('jcr:created', {requiredType: 'DATE', protected: true}))).toBe(false);
        expect(isExportable(property('j:tagList'))).toBe(false);
        expect(isExportable(property('data', {requiredType: 'BINARY'}))).toBe(false);
    });
});

describe('commonFields', () => {
    it('should list the editable fields of one type, sorted by label, with their editor', () => {
        const fields = commonFields([node('news', [
            property('title'),
            property('date', {requiredType: 'DATE'}),
            property('jcr:created', {requiredType: 'DATE'}),
            property('level', {constraints: ['low', 'high']})
        ])]);
        expect(fields.map(field => [field.key, field.kind])).toEqual([
            ['date', EDITOR_KINDS.DATE],
            ['level', EDITOR_KINDS.CHOICE],
            ['title', EDITOR_KINDS.TEXT]
        ]);
    });

    it('should keep only the fields that every selected type declares the same way', () => {
        const fields = commonFields([
            node('news', [property('title'), property('author'), property('rank', {requiredType: 'LONG'})]),
            node('event', [property('title'), property('rank', {requiredType: 'STRING'})]),
            node('news', [property('title'), property('author'), property('rank', {requiredType: 'LONG'})])
        ]);
        expect(fields.map(field => field.key)).toEqual(['title']);
    });

    it('should list nothing without nodes', () => {
        expect(commonFields(undefined)).toEqual([]);
    });
});

describe('toStoredValue', () => {
    it('should store a day as the start of that day', () => {
        expect(toStoredValue({kind: EDITOR_KINDS.DATE}, '2026-11-16')).toEqual(new Date('2026-11-16T00:00:00').toISOString());
    });

    it('should store other values as text', () => {
        expect(toStoredValue({kind: EDITOR_KINDS.NUMBER}, 12)).toEqual('12');
    });
});

describe('canSave', () => {
    it('should refuse to clear a mandatory field', () => {
        expect(canSave({field: {mandatory: true}, isClearing: true})).toBe(false);
        expect(canSave({field: {mandatory: false}, isClearing: true})).toBe(true);
    });

    it('should need a value', () => {
        expect(canSave({field: {}, value: '  '})).toBe(false);
        expect(canSave({field: {}, value: 'x'})).toBe(true);
        expect(canSave({field: {multiple: true}, value: []})).toBe(false);
    });
});

describe('replaceValueItem', () => {
    it('should write a translated value in the given language only', () => {
        const built = replaceValueItem({field: {internationalized: true, kind: EDITOR_KINDS.TEXT}, value: 'Jane', language: 'fr'})({path: '/a'}, 3);
        expect(built.selection).toEqual('mutateProperty(name: $property) { setValue(language: $language3, type: $type, value: $value3) }');
        expect(built.variables).toEqual({language3: 'fr', value3: 'Jane'});
    });

    it('should set the values of a multiple field', () => {
        const built = replaceValueItem({field: {multiple: true, kind: EDITOR_KINDS.TEXT}, value: ['a', 'b']})({path: '/a'}, 0);
        expect(built.selection).toEqual('mutateProperty(name: $property) { setValues(type: $type, values: $values0) }');
        expect(built.variables).toEqual({values0: ['a', 'b']});
    });

    it('should delete the property to clear it', () => {
        const built = replaceValueItem({field: {}, isClearing: true})({path: '/a'}, 1);
        expect(built.selection).toEqual('mutateProperty(name: $property) { delete }');
    });
});
