import {dsGenericTheme} from '@jahia/design-system-kit';
import {shallowWithTheme} from '@jahia/test-framework';
import React from 'react';
import {DatePickerInput} from './DatePickerInput';

describe('DatePickerInput', () => {
    let defaultProps;

    const dateTimeInput = cmp => cmp.find('DateTimeInput');

    const shallowInput = props => shallowWithTheme(
        <DatePickerInput {...defaultProps} {...props}/>,
        {},
        dsGenericTheme
    );

    beforeEach(() => {
        defaultProps = {
            lang: 'fr'
        };
    });

    it('should map the variant onto the DateTimeInput type', () => {
        expect(dateTimeInput(shallowInput()).props().type).toBe('date');
        expect(dateTimeInput(shallowInput({variant: 'datetime'})).props().type).toBe('dateTime');
        expect(dateTimeInput(shallowInput({variant: 'zonedDatetime'})).props().type).toBe('zonedDateTime');
    });

    it('should convert the dayjs display format into an LDML date pattern', () => {
        const cmp = shallowInput({variant: 'datetime', displayDateFormat: 'MM/DD/YYYY HH:mm'});

        expect(dateTimeInput(cmp).props().dateFormat).toBe('MM/dd/yyyy');
    });

    it('should pass the calendar bounds through to the DateTimeInput', () => {
        const cmp = shallowInput({minDate: '2019-06-01', maxDate: '2019-06-30'});

        expect(dateTimeInput(cmp).props().minDate).toBe('2019-06-01');
        expect(dateTimeInput(cmp).props().maxDate).toBe('2019-06-30');
    });

    it('should hand a Date back to the consumer on change', () => {
        const onChange = jest.fn();
        const cmp = shallowInput({variant: 'date', onChange});

        dateTimeInput(cmp).simulate('change', {}, {toString: () => '2019-06-19'});

        expect(onChange).toHaveBeenCalledWith(new Date(2019, 5, 19));
    });

    it('should keep the time when handing a datetime to Moonstone, and read the emitted wall-clock back as a local Date', () => {
        const onChange = jest.fn();
        const cmp = shallowInput({variant: 'datetime', initialValue: new Date(2019, 5, 19, 12, 7), onChange});

        expect(dateTimeInput(cmp).props().value).toBe('2019-06-19T12:07');

        dateTimeInput(cmp).simulate('change', {}, {toString: () => '2019-06-19T14:30:00'});

        expect(onChange).toHaveBeenCalledWith(new Date(2019, 5, 19, 14, 30));
    });

    it('should convert the instant emitted by the zoned variant into a Date', () => {
        const onChange = jest.fn();
        const cmp = shallowInput({variant: 'zonedDatetime', onChange});
        const instant = {epochMilliseconds: new Date('2019-06-19T12:07:00Z').getTime()};

        dateTimeInput(cmp).simulate('change', {}, instant);

        expect(onChange).toHaveBeenCalledWith(new Date('2019-06-19T12:07:00Z'));
    });

    it('should give Moonstone a zoned value for an existing datetime, as an ISO instant', () => {
        const initialValue = new Date('2019-06-19T12:07:00Z');
        const cmp = shallowInput({
            variant: 'zonedDatetime',
            initialValue
        });

        // Never the Date itself: Moonstone's API takes Temporal instances or ISO strings only
        expect(dateTimeInput(cmp).props().value).toBe(initialValue.toISOString());
    });

    it('should tag the timezone selector for e2e tests', () => {
        expect(dateTimeInput(shallowInput({variant: 'zonedDatetime'})).props().timezoneSelectorProps)
            .toEqual({'data-sel-role': 'date-field-timezone-selector'});
    });
});
