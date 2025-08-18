import React from 'react';
import {shallow} from '@jahia/test-framework';
import {useSelector} from 'react-redux';
import NumericFormat from 'react-number-format';
import {Text} from './Text';

jest.mock('react-redux', () => {
    return {
        ...jest.requireActual('react-redux'),
        useSelector: jest.fn()
    };
});

describe('Text component', () => {
    let props;
    let state = {
        uilang: 'en'
    };

    beforeEach(() => {
        props = {
            onChange: jest.fn(),
            id: 'toto[1]',
            field: {
                name: 'toto',
                displayName: 'toto',
                readOnly: false,
                selectorType: 'Text',
                requiredType: 'STRING',
                targets: [{name: 'test'}],
                selectorOptions: []
            }
        };

        useSelector.mockImplementation(cb => cb(state));
    });

    describe('Number input tests', () => {
        beforeEach(() => {
            props.field.requiredType = 'DOUBLE';
        });

        it('should render NumericFormat for number fields', () => {
            const cmp = shallow(<Text {...props}/>);
            expect(cmp.find(NumericFormat).length).toBe(1);
        });

        it('should pass correct props to NumericFormat', () => {
            const cmp = shallow(<Text {...props}/>);
            const numericFormat = cmp.find(NumericFormat);

            expect(numericFormat.props()).toMatchObject({
                allowNegative: true,
                id: props.id,
                name: props.id,
                decimalSeparator: '.',
                customInput: expect.any(Function),
                value: '',
                disabled: false,
                'aria-labelledby': 'toto-label',
                'aria-required': undefined
            });
        });

        it('should handle value changes in NumericFormat', () => {
            const cmp = shallow(<Text {...props}/>);
            cmp.find(NumericFormat).simulate('valueChange', {value: '123.45'});
            expect(props.onChange).toHaveBeenCalledWith('123.45');
        });

        it('should use correct decimal separator based on language', () => {
            state.uilang = 'fr';
            const cmp = shallow(<Text {...props}/>);
            expect(cmp.find(NumericFormat).prop('decimalSeparator')).toBe(',');
        });

        it('should not allow decimals for LONG type', () => {
            props.field.requiredType = 'LONG';
            const cmp = shallow(<Text {...props}/>);
            expect(cmp.find(NumericFormat).prop('decimalScale')).toBe(0);
        });
    });

    it('should contain aria-labelledby attribute', () => {
        const cmp = shallow(<Text {...props}/>);
        expect(cmp.props()['aria-labelledby']).toBe('toto-label');
    });

    it('should contain one Input component', () => {
        const cmp = shallow(<Text {...props}/>);
        expect(cmp.find('Input').length).toBe(1);
    });

    it('should contain a matching Input props values', () => {
        const cmp = shallow(<Text {...props}/>);
        expect(cmp.props().id).toBe(props.id);
        expect(cmp.props().name).toBe(props.id);
    });

    it('should obtain its initial value', () => {
        props.value = 'some dummy value';
        const cmp = shallow(<Text {...props}/>);

        expect(cmp.props().value).toBe(props.value);
    });

    it('should call onChange on change', () => {
        props.value = 'toto';
        const cmp = shallow(<Text {...props}/>);
        cmp.find('Input').simulate('change', {
            target: {
                value: 'text'
            }
        });

        expect(props.onChange.mock.calls.length).toBe(1);
        expect(props.onChange).toHaveBeenCalledWith('text');
    });

    it('should be readOnly when formDefinition say so', () => {
        testReadOnly(true);
        testReadOnly(false);
    });

    let testReadOnly = function (readOnly) {
        props.field.readOnly = readOnly;
        const cmp = shallow(<Text {...props}/>);
        expect(cmp.props().isReadOnly).toBe(readOnly);
    };

    it('should be the input of type text', () => {
        const cmp = shallow(<Text {...props}/>);

        expect(cmp.props().type).toBe('text');
    });

    it('should be the input of type password', () => {
        props.field.selectorOptions = [{name: 'password'}];
        const cmp = shallow(<Text {...props}/>);

        expect(cmp.props().type).toBe('password');
    });

    it('should the interactive button manage right type for the input of type password', () => {
        props.field.selectorOptions = [{name: 'password'}];
        const cmp = shallow(<Text {...props}/>);

        expect(cmp.props().type).toBe('password');

        cmp.props().postfixComponents.props.onClick();
        expect(cmp.props().type).toBe('text');

        cmp.props().postfixComponents.props.onClick();
        expect(cmp.props().type).toBe('password');
    });
});
