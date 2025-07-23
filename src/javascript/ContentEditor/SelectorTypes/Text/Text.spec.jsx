import React from 'react';
import {shallow} from '@jahia/test-framework';
import {useSelector} from 'react-redux';

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

    it('should be the input of type number in case of long, decimal or double', () => {
        props.field.requiredType = 'DOUBLE';
        const cmp = shallow(<Text {...props}/>);

        expect(cmp.props().type).toBe('number');
    });

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
