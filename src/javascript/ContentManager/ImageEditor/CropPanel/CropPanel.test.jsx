import React from 'react';
import {shallow} from 'enzyme';
import {Input} from '@material-ui/core';
import {CropPanel} from "./CropPanel";
import defaultProps from '../../../testDefaultProps';
import {IconButton} from '@jahia/ds-mui-theme';

describe('Crop panel', () => {
    let props;
    let wrapper;

    beforeEach(() => {
        try {
            props = {
                originalWidth: 800,
                originalHeight: 600,
                onCropChange: jest.fn(),
                cropParams: {
                    top: 0,
                    left: 0
                }
            };
            wrapper = shallow(<CropPanel {...defaultProps} {...props}/>);
        } catch (e) {
            console.log(e);
        }
    });

    it('Should crop the image keeping ratio', () => {
        wrapper.find(Input).at(0).prop('onChange').call(null, {
            target: {
                value: '400'
            }
        });
        expect(props.onCropChange.mock.calls.length).toBe(1);
        expect(props.onCropChange.mock.calls[0][0].width).toBe(50);
        expect(props.onCropChange.mock.calls[0][0].height).toBe(50);

        wrapper.find(Input).at(1).prop('onChange').call(null, {
            target: {
                value: '200'
            }
        });
        expect(props.onCropChange.mock.calls.length).toBe(2);
        expect(props.onCropChange.mock.calls[1][0].width).toBe(33.375);
        expect(props.onCropChange.mock.calls[1][0].height).toBe(33.333333333333336);
    });

    it('Should crop the image without keeping ratio', () => {
        wrapper.find(IconButton).at(0).simulate('click');

        wrapper.find(Input).at(0).prop('onChange').call(null, {
            target: {
                value: '200'
            }
        });
        expect(props.onCropChange.mock.calls.length).toBe(2);
        expect(props.onCropChange.mock.calls[1][0].width).toBe(25);
        expect(props.onCropChange.mock.calls[1][0].height).toBe(25);

        wrapper.find(Input).at(1).prop('onChange').call(null, {
            target: {
                value: '200'
            }
        });
        expect(props.onCropChange.mock.calls.length).toBe(3);
        expect(props.onCropChange.mock.calls[2][0].width).toBe(33.375);
        expect(props.onCropChange.mock.calls[2][0].height).toBe(33.333333333333336);
    });

    it('Should not crop when typing garbage', () => {
        wrapper.find(Input).at(0).prop('onChange').call(null, {
            target: {
                value: 'gzgzgz'
            }
        });
        expect(props.onCropChange.mock.calls.length).toBe(0);
    });

});
