import React from 'react';
import {shallow} from '@jahia/test-framework';

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

describe('DateTimePicker component', () => {
    let props;
    let testDateFormat = (navigatorLocale, format) => {
        props.editorContext.browserLang = navigatorLocale;
        const cmp = shallow(<DateTimePicker {...props}/>).find('DatePickerInput');

        expect(cmp.props().displayDateFormat).toBe(format);
    };

    beforeEach(() => {
        props = {
            onChange: jest.fn(),
            id: 'myOption[0]',
            field: {
                name: 'myOption',
                displayName: 'myOption',
                readOnly: true,
                selectorOptions: [],
                selectorType: 'DatePicker'
            },
            editorContext: {
                lang: 'fr'
            },
            value: ''
        };
    });

    it('should bind id correctly', () => {
        const cmp = shallow(<DateTimePicker {...props}/>).find('DatePickerInput');
        expect(cmp.props().id).toBe(props.id);
    });

    it('should call onChange with the local value converted to a UTC instant, for DateTimePicker', () => {
        props.field.selectorType = 'DateTimePicker';
        const cmp = shallow(<DateTimePicker {...props}/>).find('DatePickerInput');
        const localDate = new Date(2019, 6, 14, 21, 7, 12);
        cmp.simulate('change', localDate);

        expect(props.onChange).toHaveBeenCalledWith(localDate.toISOString());
    });

    it('should call onChange with just the picked calendar day, for DatePicker', () => {
        // No time-of-day, so no instant conversion -- the day must come back exactly as picked,
        // as UTC midnight, regardless of this test runner's own local timezone.
        props.field.selectorType = 'DatePicker';
        const cmp = shallow(<DateTimePicker {...props}/>).find('DatePickerInput');
        cmp.simulate('change', new Date(2019, 6, 14));

        expect(props.onChange).toHaveBeenCalledWith('2019-07-14T00:00:00.000Z');
    });

    it('should call onChange with null when cleared', () => {
        const cmp = shallow(<DateTimePicker {...props}/>).find('DatePickerInput');
        cmp.simulate('change', null);

        expect(props.onChange).toHaveBeenCalledWith(null);
    });

    it('should render a hint showing the browser\'s timezone, for DateTimePicker', () => {
        props.field.selectorType = 'DateTimePicker';
        const cmp = shallow(<DateTimePicker {...props}/>);
        expect(cmp.find('[data-sel-role="date-field-timezone-hint"]').exists()).toBe(true);
    });

    it('should NOT render a timezone hint for DatePicker, since its value has no timezone dependency', () => {
        props.field.selectorType = 'DatePicker';
        const cmp = shallow(<DateTimePicker {...props}/>);
        expect(cmp.find('[data-sel-role="date-field-timezone-hint"]').exists()).toBe(false);
    });

    it('should give readOnly', () => {
        const cmp = shallow(<DateTimePicker {...props}/>).find('DatePickerInput');
        expect(cmp.props().readOnly).toBe(true);
    });

    it('should give readOnly at false', () => {
        props.field.readOnly = false;
        const cmp = shallow(<DateTimePicker {...props}/>).find('DatePickerInput');

        expect(cmp.props().readOnly).toBe(false);
    });

    it('should use specific date format when it is handle in specificDateFormat and DD/MM/YYYY otherwise', () => {
        testDateFormat('de-DE', 'DD.MM.YYYY');
        testDateFormat('en-US', 'MM/DD/YYYY');
        testDateFormat('zh-CN', 'YYYY/MM/DD');
        testDateFormat('random', 'DD/MM/YYYY');
    });

    it('should display date variant for DatePicker', () => {
        const cmp = shallow(<DateTimePicker {...props}/>).find('DatePickerInput');

        expect(cmp.props().variant).toBe('date');
    });

    it('should display datetime variant for DateTimePicker', () => {
        props.field.selectorType = 'DateTimePicker';
        const cmp = shallow(<DateTimePicker {...props}/>).find('DatePickerInput');

        expect(cmp.props().variant).toBe('datetime');
    });

    it('should set constraints on DatePicker', () => {
        props.field.selectorType = 'DatePicker';
        props.field.valueConstraints = [{
            value: {string: '(2019-06-04T00:00:00.000,)'},
            displayValue: 'yolo'
        }];
        const cmp = shallow(<DateTimePicker {...props}/>).find('DatePickerInput');

        expect(cmp.props().dayPickerProps.disabledDays).toEqual([{before: new Date('2019-06-05T00:00:00.000')}]);
    });

    it('should set constraints on DateTimePicker', () => {
        props.field.selectorType = 'DateTimePicker';
        props.field.valueConstraints = [{
            value: {string: '(2019-06-04T10:00:00.000,2019-06-05T10:00:00.000)'},
            displayValue: 'yolo'
        }];
        const cmp = shallow(<DateTimePicker {...props}/>).find('DatePickerInput');

        expect(cmp.props().dayPickerProps.disabledDays).toEqual([{before: new Date('2019-06-04T10:01:00.000')}, {after: new Date('2019-06-05T09:59:00.000')}]);
    });

    it('should set constraints on DateTimePicker with limit inclusion', () => {
        props.field.selectorType = 'DateTimePicker';
        props.field.valueConstraints = [{
            value: {string: '[2019-06-04T00:00:00.000,)'},
            displayValue: 'toto'
        }];
        const cmp = shallow(<DateTimePicker {...props}/>).find('DatePickerInput');

        expect(cmp.props().dayPickerProps.disabledDays).toEqual([{before: new Date('2019-06-04T00:00:00.000')}]);
    });

    it('should use the override date format when provided', () => {
        window.contextJsParameters = {
            config: {
                jcontent: {
                    forceDateFormat: 'MM/DD/YYYY'
                }
            }
        };
        testDateFormat('de-DE', 'MM/DD/YYYY');
    });

    it('should use the override date format when provided with leading/trailing spaces', () => {
        window.contextJsParameters = {
            config: {
                jcontent: {
                    forceDateFormat: '  MM/DD/YYYY   '
                }
            }
        };
        testDateFormat('de-DE', 'MM/DD/YYYY');
    });

    it('should NOT use the override date format when an invalid format is provided', () => {
        window.contextJsParameters = {
            config: {
                jcontent: {
                    forceDateFormat: 'MM/DD/INVALID'
                }
            }
        };
        testDateFormat('de-DE', 'DD.MM.YYYY');
    });
});
