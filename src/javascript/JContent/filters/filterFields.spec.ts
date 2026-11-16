import {STANDARD_FILTER_FIELDS, buildFilterFields, formFieldsOf, isMediaReference, propertyToFilterField} from './filterFields';
import type {FormField, PropertyDefinition} from './filterFields';

const t = (key: string) => `t(${key.split('.').pop()})`;

const news: PropertyDefinition[] = [
    {name: 'jcr:title', displayName: 'Title', requiredType: 'STRING'},
    {name: 'date', displayName: 'Date', requiredType: 'DATE'},
    {name: 'featured', displayName: 'Featured', requiredType: 'BOOLEAN'},
    {name: 'category', displayName: 'Category', requiredType: 'STRING', constraints: ['local', 'world', 'sport']},
    {name: 'image', displayName: 'Image', requiredType: 'WEAKREFERENCE', constraints: ['{http://www.jahia.org/jahia/mix/1.0}image']},
    {name: 'body', displayName: 'Body', requiredType: 'STRING'},
    {name: 'related', displayName: 'Related', requiredType: 'WEAKREFERENCE', constraints: ['jnt:content']},
    {name: 'price', displayName: 'Price', requiredType: 'DOUBLE'},
    {name: 'secret', displayName: 'Secret', requiredType: 'STRING', hidden: true},
    {name: 'jcr:created', requiredType: 'DATE', protected: true},
    {name: 'file', requiredType: 'BINARY'},
    {name: 'j:internal', requiredType: 'STRING'},
    {name: '*', requiredType: 'STRING'}
];

const form: FormField[] = [
    {name: 'jcr:title', selectorType: 'Text'},
    {
        name: 'category',
        selectorType: 'Choicelist',
        valueConstraints: [
            {value: {string: 'local'}, displayValue: 'Local'},
            {value: {string: 'world'}, displayValue: 'World'},
            {value: {string: 'sport'}, displayValue: 'Sport'}
        ]
    },
    {name: 'body', selectorType: 'RichText'}
];

describe('the standard fields', () => {
    it('lists 9 fields with the std: prefix', () => {
        expect(STANDARD_FILTER_FIELDS.map(field => field.key)).toEqual([
            'std:created', 'std:createdBy', 'std:lastModified', 'std:lastModifiedBy', 'std:lastPublished',
            'std:lastPublishedBy', 'std:tags', 'std:systemName', 'std:type'
        ]);
    });

    it('case 2: gives the standard fields only for a list of mixed types', () => {
        const fields = buildFilterFields({t});
        expect(fields).toHaveLength(9);
        expect(fields[0]).toEqual({key: 'std:created', label: 't(created)', property: 'jcr:created', kind: 'date'});
        expect(fields.find(field => field.key === 'std:systemName')).toMatchObject({property: 'j:nodename', looseSeparators: true});
        expect(fields.find(field => field.key === 'std:tags')).toMatchObject({property: 'j:tagList', multiple: true});
    });

    it('case 6: gives the content types as the values of the Content type field', () => {
        const contentTypes = [{value: 'jnt:news', label: 'News'}, {value: 'jnt:banner', label: 'Banner'}];
        expect(buildFilterFields({t, contentTypes}).find(field => field.key === 'std:type'))
            .toEqual({key: 'std:type', label: 't(type)', property: 'jcr:primaryType', kind: 'choice', options: contentTypes});
    });
});

describe('the fields of a content type', () => {
    it('case 1: gives the standard fields, then the properties in the order of the definition', () => {
        const fields = buildFilterFields({t, definitions: news, formFields: form});
        expect(fields.map(field => field.key)).toEqual([
            ...STANDARD_FILTER_FIELDS.map(field => field.key),
            'prop:jcr:title', 'prop:date', 'prop:featured', 'prop:category', 'prop:image', 'prop:price'
        ]);
    });

    it('case 1: gives a choice with the values and their labels of the form', () => {
        const category = buildFilterFields({t, definitions: news, formFields: form}).find(field => field.key === 'prop:category');
        expect(category).toEqual({
            key: 'prop:category',
            label: 'Category',
            kind: 'choice',
            property: 'category',
            multiple: false,
            options: [{value: 'local', label: 'Local'}, {value: 'world', label: 'World'}, {value: 'sport', label: 'Sport'}]
        });
    });

    it('maps each JCR type to its kind', () => {
        const kinds = Object.fromEntries(buildFilterFields({t, definitions: news, formFields: form})
            .filter(field => field.key.startsWith('prop:'))
            .map(field => [field.property, field.kind]));
        expect(kinds).toEqual({'jcr:title': 'text', date: 'date', featured: 'boolean', category: 'choice', image: 'media', price: 'number'});
    });

    it('case 3: gives no field for a rich text, a reference to a content item, a hidden, a protected or a binary property', () => {
        const keys = buildFilterFields({t, definitions: news, formFields: form}).map(field => field.key);
        ['prop:body', 'prop:related', 'prop:secret', 'prop:jcr:created', 'prop:file', 'prop:j:internal', 'prop:*'].forEach(key => {
            expect(keys).not.toContain(key);
        });
    });

    it('case 5: gives text for a value list and offers a rich text when the form is not read', () => {
        const fields = buildFilterFields({t, definitions: news});
        expect(fields.find(field => field.key === 'prop:category').kind).toBe('text');
        expect(fields.find(field => field.key === 'prop:body').kind).toBe('text');
    });

    it('keeps the cardinality of the property', () => {
        expect(propertyToFilterField({name: 'options', requiredType: 'STRING', multiple: true})).toMatchObject({multiple: true});
    });

    it('gives no second field for a property that a standard field covers', () => {
        const fields = buildFilterFields({t, definitions: [{name: 'j:tagList', requiredType: 'STRING', multiple: true}, {name: 'jcr:createdBy', requiredType: 'STRING'}]});
        expect(fields).toHaveLength(9);
    });
});

describe('isMediaReference', () => {
    it('reads an expanded or a prefixed constraint that names a media type', () => {
        expect(isMediaReference({name: 'a', requiredType: 'WEAKREFERENCE', constraints: ['{http://www.jahia.org/jahia/mix/1.0}image']})).toBe(true);
        expect(isMediaReference({name: 'a', requiredType: 'REFERENCE', constraints: ['jmix:image']})).toBe(true);
        expect(isMediaReference({name: 'a', requiredType: 'REFERENCE', constraints: ['jnt:videoFile']})).toBe(true);
        expect(isMediaReference({name: 'a', requiredType: 'WEAKREFERENCE', constraints: ['jnt:file']})).toBe(true);
    });

    it('refuses a reference to a content item, a reference with no constraint and a string', () => {
        expect(isMediaReference({name: 'a', requiredType: 'WEAKREFERENCE', constraints: ['jnt:content']})).toBe(false);
        expect(isMediaReference({name: 'a', requiredType: 'WEAKREFERENCE'})).toBe(false);
        expect(isMediaReference({name: 'a', requiredType: 'STRING', constraints: ['image']})).toBe(false);
    });
});

describe('formFieldsOf', () => {
    it('flattens the sections and the field sets', () => {
        expect(formFieldsOf({sections: [{fieldSets: [{fields: [{name: 'a'}]}, {fields: [{name: 'b'}]}]}, {}]}).map(field => field.name))
            .toEqual(['a', 'b']);
        expect(formFieldsOf(undefined)).toEqual([]);
    });
});
