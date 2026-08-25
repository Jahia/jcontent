import {registerDateTimePicker} from './registerDateTimePicker';

describe('registerDateTimePicker', () => {
    let ceRegistry;
    let registrations;

    beforeEach(() => {
        registrations = {};
        ceRegistry = {
            add: jest.fn((type, selectorType, definition) => {
                registrations[selectorType] = definition;
            })
        };

        registerDateTimePicker(ceRegistry);
    });

    it('should register both DateTimePicker and DatePicker selector types', () => {
        expect(ceRegistry.add).toHaveBeenCalledTimes(2);
        expect(ceRegistry.add).toHaveBeenCalledWith('selectorType', 'DateTimePicker', expect.any(Object));
        expect(ceRegistry.add).toHaveBeenCalledWith('selectorType', 'DatePicker', expect.any(Object));
    });

    describe.each(['DateTimePicker', 'DatePicker'])('%s adaptValue', selectorType => {
        it('should return property.value for a non-multiple field, ignoring a stale notZonedDateValue', () => {
            const field = {multiple: false};
            const property = {value: 'utc-value', notZonedDateValue: 'stale-value'};

            expect(registrations[selectorType].adaptValue(field, property)).toBe('utc-value');
        });

        it('should return property.values for a multiple field, ignoring a stale notZonedDateValues', () => {
            const field = {multiple: true};
            const property = {values: ['utc-value-1', 'utc-value-2'], notZonedDateValues: ['stale-value']};

            expect(registrations[selectorType].adaptValue(field, property)).toEqual(['utc-value-1', 'utc-value-2']);
        });
    });
});
