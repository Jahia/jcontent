import React from 'react';
import {shallow} from '@jahia/test-framework';
import {dayjs} from 'date-formatter';

import {DateTimePicker} from './DateTimePicker';

jest.mock('react', () => {
    return {
        ...jest.requireActual('react'),
        useEffect: cb => cb()
    };
});

jest.mock('react-redux', () => {
    return {
        ...jest.requireActual('react-redux'),
        useSelector: cb => cb({uilang: 'en'})
    };
});

describe('DateTimePicker component - legacy NOT_ZONED_DATE / UTC interop', () => {
    let props;
    let originalTz;

    beforeAll(() => {
        // Pin a non-UTC zone so the local <-> UTC conversions below are actually exercised
        // and the expectations aren't silently true-at-UTC-only. Matches DateTimePicker.spec.js.
        originalTz = process.env.TZ;
        process.env.TZ = 'America/New_York';
    });

    afterAll(() => {
        process.env.TZ = originalTz;
    });

    beforeEach(() => {
        props = {
            onChange: jest.fn(),
            id: 'myOption[0]',
            field: {
                name: 'myOption',
                displayName: 'myOption',
                readOnly: true,
                selectorOptions: [],
                selectorType: 'DateTimePicker'
            },
            editorContext: {
                lang: 'fr'
            },
            value: ''
        };
    });

    it('renders the old server-offset (NOT_ZONED_DATE) format and the new UTC format identically, for the same instant', () => {
        // Old scheme: a real ISO-8601 instant, but with the SERVER's own offset baked in
        // (e.g. a Paris server writing +01:00) instead of UTC's Z.
        const oldServerOffsetValue = '2027-01-01T00:00:00.000+01:00';

        // Derive the new-scheme (UTC) serialization FROM the old one programmatically, rather
        // than hand-computing the offset arithmetic, to avoid an off-by-one-hour mistake here.
        const newUtcValue = new Date(oldServerOffsetValue).toISOString();

        props.value = oldServerOffsetValue;
        const oldCmp = shallow(<DateTimePicker {...props}/>).find('DatePickerInput');

        props.value = newUtcValue;
        const newCmp = shallow(<DateTimePicker {...props}/>).find('DatePickerInput');

        const oldInitialValue = oldCmp.props().initialValue;
        const newInitialValue = newCmp.props().initialValue;

        expect(oldInitialValue).toBeInstanceOf(Date);
        expect(newInitialValue).toBeInstanceOf(Date);
        expect(oldInitialValue.getTime()).toBe(newInitialValue.getTime());
        expect(oldInitialValue.toISOString()).toBe(newInitialValue.toISOString());
    });

    it('does not throw on a bare, zone-less value (the original pre-#2653 bug format) and produces a valid date', () => {
        // Neither the old (NOT_ZONED_DATE) nor the new (UTC) scheme would intentionally produce
        // this -- it documents graceful degradation (dayjs's default local-time parsing) for any
        // stray legacy data predating either fix, rather than a crash.
        props.value = '2027-01-01T00:00:00.000';

        let cmp;
        expect(() => {
            cmp = shallow(<DateTimePicker {...props}/>).find('DatePickerInput');
        }).not.toThrow();

        const initialValue = cmp.props().initialValue;
        expect(initialValue).toBeInstanceOf(Date);
        expect(Number.isNaN(initialValue.getTime())).toBe(false);
    });

    it('re-reading and re-saving an already-UTC value is a no-op on the stored value', () => {
        const originalUtcValue = '2027-01-01T05:00:00.000Z';

        // Read path: what the picker would display for this stored value.
        const displayedDate = dayjs(originalUtcValue).toDate();

        // Write path: simulate that displayed value being re-saved without any actual edit.
        const cmp = shallow(<DateTimePicker {...props}/>).find('DatePickerInput');
        cmp.simulate('change', displayedDate);

        expect(props.onChange).toHaveBeenCalledWith(originalUtcValue);
    });
});
