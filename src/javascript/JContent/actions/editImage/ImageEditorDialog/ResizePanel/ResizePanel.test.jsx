import React from 'react';
import {mount, shallow} from '@jahia/test-framework';
import {Input} from '@material-ui/core';
import {ResizePanel} from './ResizePanel';
import defaultProps from '../../../../../testDefaultProps';

describe('Resize panel', () => {
    let props;
    let wrapper;

    beforeEach(() => {
        props = {
            originalWidth: 200,
            originalHeight: 100,
            resizeParams: {
                width: 100,
                height: 200
            },
            onResize: jest.fn(param => param)
        };

        wrapper = shallow(<ResizePanel {...defaultProps} {...props}/>);
    });

    it('Should resize the image keeping ratio', () => {
        wrapper.find(Input).at(0).simulate('change', {
            target: {
                value: '50',
                checkValidity: () => true
            }
        });
        expect(props.onResize.mock.calls.length).toBe(1);
        expect(props.onResize.mock.calls[0][0].width).toBe(50);

        wrapper.find(Input).at(1).simulate('change', {
            target: {
                value: '100',
                checkValidity: () => true
            }
        });
        expect(props.onResize.mock.calls.length).toBe(2);
        expect(props.onResize.mock.calls[1][0].height).toBe(100);
    });

    it('Should not resize the image if size is too large', () => {
        wrapper.find(Input).at(0).simulate('change', {
            target: {
                value: '201',
                checkValidity: () => true
            }
        });
        expect(props.onResize.mock.results[0].value.width)
            .toBe(props.originalWidth);

        wrapper.find(Input).at(1).simulate('change', {
            target: {
                value: '201',
                checkValidity: () => true
            }
        });
        expect(props.onResize.mock.results[1].value.height)
            .toBe(props.originalHeight);
    });

    it('Should not resize when typing garbage', () => {
        mount(<ResizePanel {...defaultProps} {...props}/>)
            .find(Input).at(0).simulate('change', {
                target: {
                    value: 'gzgzgz',
                    checkValidity: () => true
                }
            });
        expect(props.onResize.mock.calls.length).toBe(0);
    });
});
