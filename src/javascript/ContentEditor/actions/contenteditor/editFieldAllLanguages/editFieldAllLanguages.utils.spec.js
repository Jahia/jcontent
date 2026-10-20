import {registry} from '@jahia/ui-extender';
import {registerSelectorTypes} from '~/ContentEditor/SelectorTypes/registerSelectorTypes';
import {adaptRowValue, buildPropertyMutation, hasValue, hasValueChanged} from './editFieldAllLanguages.utils';

jest.mock('~/JContent/ContentRoute/ContentLayout/ContentTable/reactTable', () => ({}));
jest.mock('~/JContent/ContentRoute/ContentLayout/queryHandlers', () => ({FilesQueryHandler: {}}));
jest.mock('react-dnd-html5-backend', () => ({getEmptyImage: jest.fn().mockReturnValue({})}));

describe('editFieldAllLanguages.utils', () => {
    registerSelectorTypes(registry);

    describe('adaptRowValue', () => {
        it('returns the raw string for a single-valued Text field', () => {
            const field = {selectorType: 'Text', multiple: false};
            expect(adaptRowValue(field, {values: [{string: 'hello', type: 'STRING'}]})).toBe('hello');
        });

        it('returns an array of strings for a multiple Text field', () => {
            const field = {selectorType: 'Text', multiple: true};
            expect(adaptRowValue(field, {values: [{string: 'a'}, {string: 'b'}]})).toEqual(['a', 'b']);
        });

        it('adapts a Checkbox field to an actual boolean', () => {
            const field = {selectorType: 'Checkbox', multiple: false};
            expect(adaptRowValue(field, {values: [{string: 'true'}]})).toBe(true);
            expect(adaptRowValue(field, {values: [{string: 'false'}]})).toBe(false);
        });

        it('uses the notZonedDate value for a DateTimePicker field', () => {
            const field = {selectorType: 'DateTimePicker', multiple: false};
            expect(adaptRowValue(field, {values: [{string: '2024-01-01T10:00:00', type: 'DATE'}]})).toBe('2024-01-01T10:00:00');
        });

        it('falls back to the selectorType initValue when there is no value in that language', () => {
            const field = {selectorType: 'Checkbox', multiple: false, mandatory: true};
            expect(adaptRowValue(field, {values: []})).toBe(false);
        });

        it('returns undefined when there is no value and no initValue', () => {
            const field = {selectorType: 'Text', multiple: false};
            expect(adaptRowValue(field, {values: []})).toBeUndefined();
            expect(adaptRowValue(field, undefined)).toBeUndefined();
        });
    });

    describe('hasValueChanged', () => {
        it('detects a change on a single-valued field', () => {
            expect(hasValueChanged({multiple: false}, 'a', 'b')).toBe(true);
            expect(hasValueChanged({multiple: false}, 'a', 'a')).toBe(false);
        });

        it('detects a change on a multiple field regardless of array identity', () => {
            expect(hasValueChanged({multiple: true}, ['a', 'b'], ['a', 'b'])).toBe(false);
            expect(hasValueChanged({multiple: true}, ['a', 'b'], ['a', 'c'])).toBe(true);
            expect(hasValueChanged({multiple: true}, ['a'], ['a', 'b'])).toBe(true);
        });
    });

    describe('hasValue', () => {
        it('is false for an empty single value', () => {
            expect(hasValue({multiple: false}, undefined)).toBe(false);
            expect(hasValue({multiple: false}, null)).toBe(false);
            expect(hasValue({multiple: false}, '')).toBe(false);
        });

        it('is true for a non-empty single value', () => {
            expect(hasValue({multiple: false}, 'hello')).toBe(true);
        });

        it('is false for a multiple field with no non-empty entries', () => {
            expect(hasValue({multiple: true}, [])).toBe(false);
            expect(hasValue({multiple: true}, undefined)).toBe(false);
            expect(hasValue({multiple: true}, ['', undefined])).toBe(false);
        });

        it('is true for a multiple field with at least one non-empty entry', () => {
            expect(hasValue({multiple: true}, ['', 'a'])).toBe(true);
        });
    });

    describe('buildPropertyMutation', () => {
        it('builds a save entry for a single value', () => {
            const field = {propertyName: 'text', requiredType: 'STRING', multiple: false};
            expect(buildPropertyMutation(field, 'en', 'hello')).toEqual({
                toSave: {name: 'text', type: 'STRING', language: 'en', value: 'hello'}
            });
        });

        it('builds a delete entry when the single value is cleared', () => {
            const field = {propertyName: 'text', requiredType: 'STRING', multiple: false};
            expect(buildPropertyMutation(field, 'en', '')).toEqual({toDelete: {name: 'text', language: 'en'}});
        });

        it('normalizes decimal separators for DECIMAL fields', () => {
            const field = {propertyName: 'price', requiredType: 'DECIMAL', multiple: false};
            expect(buildPropertyMutation(field, 'en', '1,5')).toEqual({
                toSave: {name: 'price', type: 'DECIMAL', language: 'en', value: '1.5'}
            });
        });

        it('builds a save entry for a multiple value, dropping empty entries', () => {
            const field = {propertyName: 'tags', requiredType: 'STRING', multiple: true};
            expect(buildPropertyMutation(field, 'en', ['a', '', 'b'])).toEqual({
                toSave: {name: 'tags', type: 'STRING', language: 'en', values: ['a', 'b']}
            });
        });

        it('builds a delete entry when all multiple values are cleared', () => {
            const field = {propertyName: 'tags', requiredType: 'STRING', multiple: true};
            expect(buildPropertyMutation(field, 'en', [])).toEqual({toDelete: {name: 'tags', language: 'en'}});
        });
    });
});
