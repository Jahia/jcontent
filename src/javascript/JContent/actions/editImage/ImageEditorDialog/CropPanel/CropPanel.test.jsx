import React from 'react';
import {shallow} from '@jahia/test-framework';
import {Input} from '@material-ui/core';
import {CropPanel} from './CropPanel';
import defaultProps from '../../../../../testDefaultProps';
import {Button} from '@jahia/moonstone';

describe('Crop panel', () => {
    let props;
    let wrapper;

    beforeEach(() => {
        try {
            props = {
                originalWidth: 800,
                originalHeight: 600,
                onCrop: jest.fn(),
                cropParams: {
                    top: 0,
                    left: 0,
                    aspect: 2.0
                }
            };
            wrapper = shallow(<CropPanel {...defaultProps} {...props}/>);
        } catch (e) {
            console.log(e);
        }
    });

    it('Should crop the image keeping ratio', () => {
        wrapper.find(Input).at(0).simulate('change', {
            target: {
                value: '400'
            }
        });
        expect(props.onCrop.mock.calls.length).toBe(1);
        expect(props.onCrop.mock.calls[0][0].width).toBe(400);

        wrapper.find(Input).at(1).simulate('change', {
            target: {
                value: '200'
            }
        });
        expect(props.onCrop.mock.calls.length).toBe(2);
        expect(props.onCrop.mock.calls[1][0].height).toBe(200);
    });

    it('Should crop the image without keeping ratio', () => {
        wrapper.find(Button).at(0).simulate('click');

        wrapper.find(Input).at(0).simulate('change', {
            target: {
                value: '200'
            }
        });
        expect(props.onCrop.mock.calls.length).toBe(2);
        expect(props.onCrop.mock.calls[0][0].aspect).toBe(false);
        expect(props.onCrop.mock.calls[1][0].width).toBe(200);

        wrapper.find(Input).at(1).simulate('change', {
            target: {
                value: '200'
            }
        });
        expect(props.onCrop.mock.calls.length).toBe(3);
        expect(props.onCrop.mock.calls[2][0].height).toBe(200);
    });

    it('Should not crop when typing garbage', () => {
        wrapper.find(Input).at(0).simulate('change', {
            target: {
                value: 'gzgzgz'
            }
        });
        expect(props.onCrop.mock.calls.length).toBe(0);
    });
});
