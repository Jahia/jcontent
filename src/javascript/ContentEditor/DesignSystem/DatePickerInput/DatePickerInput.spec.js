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
    });

    it('should convert the dayjs display format into an LDML date pattern', () => {
        const cmp = shallowInput({variant: 'datetime', displayDateFormat: 'MM/DD/YYYY HH:mm'});

        expect(dateTimeInput(cmp).props().dateFormat).toBe('MM/dd/yyyy');
    });

    it('should map the JCR constraints onto minDate and maxDate', () => {
        const cmp = shallowInput({dayPickerProps: {disabledDays: [
            {before: new Date(2019, 5, 1)},
            {after: new Date(2019, 5, 30)}
        ]}});

        expect(dateTimeInput(cmp).props().minDate).toBe('2019-06-01');
        expect(dateTimeInput(cmp).props().maxDate).toBe('2019-06-30');
    });

    it('should hand a Date back to the consumer on change', () => {
        const onChange = jest.fn();
        const cmp = shallowInput({variant: 'datetime', onChange});

        dateTimeInput(cmp).simulate('change', {}, {toString: () => '2019-06-19T14:07:00'});

        expect(onChange).toHaveBeenCalledWith(new Date(2019, 5, 19, 14, 7, 0));
    });
});
