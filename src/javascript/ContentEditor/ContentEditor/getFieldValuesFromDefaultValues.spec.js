import {getFieldValuesFromDefaultValues} from './getFieldValuesFromDefaultValues';
import {resolveSelectorType} from '~/ContentEditor/SelectorTypes/resolveSelectorType';

jest.mock('~/ContentEditor/SelectorTypes/resolveSelectorType', () => ({
    resolveSelectorType: jest.fn()
}));

describe('getFieldValuesFromDefaultValues', () => {
    beforeEach(() => {
        resolveSelectorType.mockReset();
    });

    it('should call adaptValue with plain value/values, without any notZonedDateValue(s) key', () => {
        const adaptValue = jest.fn(() => 'adapted-value');
        resolveSelectorType.mockReturnValue({adaptValue});

        const field = {
            name: 'myField',
            multiple: false,
            defaultValues: [{string: 'first-value'}, {string: 'second-value'}]
        };

        const formFields = getFieldValuesFromDefaultValues(field);

        expect(adaptValue).toHaveBeenCalledTimes(1);
        const [calledField, calledProperty] = adaptValue.mock.calls[0];
        expect(calledField).toBe(field);
        expect(calledProperty.value).toBe('first-value');
        expect(calledProperty.values).toEqual(['first-value', 'second-value']);
        expect(calledProperty).not.toHaveProperty('notZonedDateValue');
        expect(calledProperty).not.toHaveProperty('notZonedDateValues');

        expect(formFields).toEqual({myField: 'adapted-value'});
    });

    it('should fall back to the mapped values when the selectorType has no adaptValue', () => {
        resolveSelectorType.mockReturnValue({});

        const singleField = {
            name: 'singleField',
            multiple: false,
            defaultValues: [{string: 'only-value'}]
        };
        expect(getFieldValuesFromDefaultValues(singleField)).toEqual({singleField: 'only-value'});

        const multipleField = {
            name: 'multipleField',
            multiple: true,
            defaultValues: [{string: 'value-1'}, {string: 'value-2'}]
        };
        expect(getFieldValuesFromDefaultValues(multipleField)).toEqual({multipleField: ['value-1', 'value-2']});
    });

    it('should call initValue when there are no defaultValues and the selectorType has one', () => {
        const initValue = jest.fn(() => 'init-value');
        resolveSelectorType.mockReturnValue({initValue});

        const field = {name: 'myField', multiple: false, defaultValues: []};

        const formFields = getFieldValuesFromDefaultValues(field);

        expect(initValue).toHaveBeenCalledWith(field);
        expect(formFields).toEqual({myField: 'init-value'});
    });
});
