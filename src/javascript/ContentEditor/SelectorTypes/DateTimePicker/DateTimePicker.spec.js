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

        expect(props.onChange).toHaveBeenCalledWith(localDate.toISOString(), true);
    });

    it('should call onChange with just the picked calendar day, for DatePicker', () => {
        // No time-of-day, so no instant conversion -- the day must come back exactly as picked,
        // as UTC midnight, regardless of this test runner's own local timezone.
        props.field.selectorType = 'DatePicker';
        const cmp = shallow(<DateTimePicker {...props}/>).find('DatePickerInput');
        cmp.simulate('change', new Date(2019, 6, 14));

        expect(props.onChange).toHaveBeenCalledWith('2019-07-14T00:00:00.000Z', true);
    });

    it('should call onChange with a UTC instant for the zoned DateTimePicker too', () => {
        props.field.selectorType = 'DateTimePicker';
        props.field.declaringNodeType = 'jnt:startEndDateCondition';
        const cmp = shallow(<DateTimePicker {...props}/>).find('DatePickerInput');
        cmp.simulate('change', new Date('2027-06-19T21:30:00.000Z'));

        expect(props.onChange).toHaveBeenCalledWith('2027-06-19T21:30:00.000Z', true);
    });

    it('should call onChange with null when cleared', () => {
        const cmp = shallow(<DateTimePicker {...props}/>).find('DatePickerInput');
        cmp.simulate('change', null);

        expect(props.onChange).toHaveBeenCalledWith(null, true);
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

    it('should display the zonedDatetime variant only for a visibility condition DateTimePicker', () => {
        props.field.selectorType = 'DateTimePicker';
        props.field.declaringNodeType = 'jnt:startEndDateCondition';
        expect(shallow(<DateTimePicker {...props}/>).find('DatePickerInput').props().variant).toBe('zonedDatetime');

        props.field.declaringNodeType = 'qant:allFields';
        expect(shallow(<DateTimePicker {...props}/>).find('DatePickerInput').props().variant).toBe('datetime');

        props.field.selectorType = 'DatePicker';
        props.field.declaringNodeType = 'jnt:startEndDateCondition';
        expect(shallow(<DateTimePicker {...props}/>).find('DatePickerInput').props().variant).toBe('date');
    });

    it('should set constraints on DatePicker', () => {
        props.field.selectorType = 'DatePicker';
        props.field.valueConstraints = [{
            value: {string: '(2019-06-04T00:00:00.000,)'},
            displayValue: 'yolo'
        }];
        const cmp = shallow(<DateTimePicker {...props}/>).find('DatePickerInput');

        expect(cmp.props().minDate).toBe('2019-06-05');
        expect(cmp.props().maxDate).toBeUndefined();
    });

    it('should set day constraints on DateTimePicker, nudging exclusive bounds by a minute', () => {
        props.field.selectorType = 'DateTimePicker';
        props.field.valueConstraints = [{
            value: {string: '(2019-06-04T10:00:00.000,2019-06-05T00:00:00.000)'},
            displayValue: 'yolo'
        }];
        const cmp = shallow(<DateTimePicker {...props}/>).find('DatePickerInput');

        // 10:01 on the 4th keeps its day; 23:59 on the 4th excludes the 5th
        expect(cmp.props().minDate).toBe('2019-06-04');
        expect(cmp.props().maxDate).toBe('2019-06-04');
    });

    it('should set constraints on DateTimePicker with limit inclusion', () => {
        props.field.selectorType = 'DateTimePicker';
        props.field.valueConstraints = [{
            value: {string: '[2019-06-04T00:00:00.000,)'},
            displayValue: 'toto'
        }];
        const cmp = shallow(<DateTimePicker {...props}/>).find('DatePickerInput');

        expect(cmp.props().minDate).toBe('2019-06-04');
        expect(cmp.props().maxDate).toBeUndefined();
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
