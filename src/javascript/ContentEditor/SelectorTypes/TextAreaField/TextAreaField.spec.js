import React from 'react';
import {shallow} from '@jahia/test-framework';

import {TextAreaField} from './TextAreaField';

describe('TextArea component', () => {
    let props;
    beforeEach(() => {
        props = {
            onChange: jest.fn(),
            value: 'Yolooo',
            id: 'textArea1',
            field: {
                name: 'myOption',
                displayName: 'myOption',
                readOnly: false,
                selectorType: 'TextArea'
            },
            classes: {}
        };
    });

    it('should field be readOnly', () => {
        props.field.readOnly = true;
        const cmp = shallow(<TextAreaField {...props}/>);

        expect(cmp.props().readOnly).toBe(true);
    });

    it('should field not be readOnly', () => {
        const cmp = shallow(<TextAreaField {...props}/>);

        expect(cmp.props().readOnly).toBe(false);
    });

    it('should set initial value', () => {
        const cmp = shallow(<TextAreaField {...props}/>);
        expect(cmp.props().value).toBe(props.value);
    });

    it('should call onChange on change', () => {
        const cmp = shallow(<TextAreaField {...props}/>);
        cmp.find('TextArea').simulate('change', {
            target: {
                value: 'text'
            }
        });

        expect(props.onChange.mock.calls.length).toBe(1);
        expect(props.onChange).toHaveBeenCalledWith('text');
    });

    it('should not set any height style when no height option is set', () => {
        const cmp = shallow(<TextAreaField {...props}/>);
        expect(cmp.props().style).toBeUndefined();
    });

    it('should apply the height selector option to height and maxHeight', () => {
        props.field.selectorOptions = [{name: 'height', value: '220'}];
        const cmp = shallow(<TextAreaField {...props}/>);
        expect(cmp.props().style).toEqual({height: 220, maxHeight: 220});
    });

    it('should not set any height style for a non-numeric height option', () => {
        props.field.selectorOptions = [{name: 'height', value: 'not-a-number'}];
        const cmp = shallow(<TextAreaField {...props}/>);
        expect(cmp.props().style).toBeUndefined();
    });
});
