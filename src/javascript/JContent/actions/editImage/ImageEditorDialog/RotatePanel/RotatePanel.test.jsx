import React from 'react';
import {shallow} from '@jahia/test-framework';
import {Button} from '@jahia/moonstone';
import {RotatePanel} from './RotatePanel';
import defaultProps from '../../../../../testDefaultProps';

describe('Rotate panel', () => {
    let props;
    let wrapper;

    beforeEach(() => {
        try {
            props = {
                onRotate: jest.fn()
            };

            wrapper = shallow(<RotatePanel {...defaultProps} {...props}/>);
        } catch (e) {
            console.log(e);
        }
    });

    it('Should rotate the image', () => {
        wrapper.find(Button).last().simulate('click');
        expect(props.onRotate.mock.calls.length).toBe(1);
        expect(props.onRotate.mock.calls[0][0]).toBe(1);

        wrapper.find(Button).first().simulate('click');
        expect(props.onRotate.mock.calls.length).toBe(2);
        expect(props.onRotate.mock.calls[1][0]).toBe(-1);
    });
});
