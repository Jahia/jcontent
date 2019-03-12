import React from 'react';
import {shallow} from 'enzyme';
import {Input} from '@material-ui/core';
import ResizePanel from './ResizePanel';

describe('Resize panel', () => {
    let props;
    let wrapper;

    beforeEach(() => {
        try {
            props = {
                originalWidth: 200,
                originalHeight: 100,
                width: 400,
                height: 200,
                dirty: false,
                expanded: true,
                disabled: false,
                resize: jest.fn(),
                undoChanges: jest.fn(),
                saveChanges: jest.fn(),
                onChangePanel: jest.fn()
            };

            wrapper = shallow(<ResizePanel {...props}/>);
            wrapper = wrapper.dive().dive();
        } catch (e) {
            console.log(e);
        }
    });

    it('Should resize the image keeping ratio', () => {
        wrapper.find(Input).at(0).prop('onChange').call(null, {
            target: {
                value: '50'
            }
        });
        expect(props.resize.mock.calls.length).toBe(1);
        expect(props.resize.mock.calls[0][0].width).toBe(50);
        expect(props.resize.mock.calls[0][0].height).toBe(25);

        wrapper.find(Input).at(1).prop('onChange').call(null, {
            target: {
                value: '300'
            }
        });
        expect(props.resize.mock.calls.length).toBe(2);
        expect(props.resize.mock.calls[1][0].width).toBe(600);
        expect(props.resize.mock.calls[1][0].height).toBe(300);
    });

    // it('Should resize the image without keeping ratio', () => {
    //     wrapper.find(IconButton).at(0).simulate('click');
    //
    //     wrapper.find(Input).at(0).prop('onChange').call(null, {
    //         target: {
    //             value: '50'
    //         }
    //     });
    //     expect(props.resize.mock.calls.length).toBe(1);
    //     expect(props.resize.mock.calls[0][0].width).toBe(50);
    //     expect(props.resize.mock.calls[0][0].height).toBe(200);
    //
    //     wrapper.find(Input).at(1).prop('onChange').call(null, {
    //         target: {
    //             value: '300'
    //         }
    //     });
    //     expect(props.resize.mock.calls.length).toBe(2);
    //     expect(props.resize.mock.calls[1][0].width).toBe(400);
    //     expect(props.resize.mock.calls[1][0].height).toBe(300);
    // });

    it('Should not resize when typing garbage', () => {
        wrapper.find(Input).at(0).prop('onChange').call(null, {
            target: {
                value: 'gzgzgz'
            }
        });
        expect(props.resize.mock.calls.length).toBe(0);
    });

});
