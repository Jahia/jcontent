import React from 'react';
import {shallow} from '@jahia/test-framework';
import {Input} from '@material-ui/core';
import {ResizePanel} from './ResizePanel';
import defaultProps from '../../../testDefaultProps';

describe('Resize panel', () => {
    let props;
    let wrapper;

    beforeEach(() => {
        props = {
            originalWidth: 200,
            originalHeight: 100,
            resizeParams: {
                width: 400,
                height: 200
            },
            onResize: jest.fn()
        };

        wrapper = shallow(<ResizePanel {...defaultProps} {...props}/>);
    });

    it('Should resize the image keeping ratio', () => {
        wrapper.find(Input).at(0).simulate('change', {
            target: {
                value: '50'
            }
        });
        expect(props.onResize.mock.calls.length).toBe(1);
        expect(props.onResize.mock.calls[0][0].width).toBe(50);

        wrapper.find(Input).at(1).simulate('change', {
            target: {
                value: '300'
            }
        });
        expect(props.onResize.mock.calls.length).toBe(2);
        expect(props.onResize.mock.calls[1][0].height).toBe(300);
    });

    it('Should not resize when typing garbage', () => {
        wrapper.find(Input).at(0).simulate('change', {
            target: {
                value: 'gzgzgz'
            }
        });
        expect(props.onResize.mock.calls.length).toBe(0);
    });
});
