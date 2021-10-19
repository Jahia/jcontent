import React from 'react';
import {shallow} from '@jahia/test-framework';

import ImageEditorActions from './ImageEditorActions';
import {Button} from '@jahia/moonstone';

describe('Image actions', () => {
    let props;
    let wrapper;

    beforeEach(() => {
        try {
            props = {
                isDirty: false,
                undoChanges: jest.fn(),
                saveChanges: jest.fn()
            };

            wrapper = shallow(<ImageEditorActions {...props}/>);
        } catch (e) {
            console.log(e);
        }
    });

    it('should have disabled buttons', () => {
        wrapper.setProps({isDirty: false});
        expect(wrapper.find(Button).everyWhere(n => n.prop('disabled'))).toBeTruthy();
    });

    it('should have enabled buttons', () => {
        wrapper.setProps({isDirty: true});
        expect(wrapper.find(Button).everyWhere(n => !n.prop('disabled'))).toBeTruthy();
    });

    it('should undo changes', () => {
        wrapper.setProps({isDirty: true});
        wrapper.find(Button).at(0).simulate('click');
        expect(props.undoChanges.mock.calls.length).toBe(1);
    });

    it('should save changes', () => {
        wrapper.setProps({isDirty: true});
        wrapper.find(Button).at(1).simulate('click');
        expect(props.saveChanges.mock.calls.length).toBe(1);
        expect(props.saveChanges.mock.calls[0][0]).toBe(true);
    });

    it('should save as changes', () => {
        wrapper.setProps({isDirty: true});
        wrapper.find(Button).at(2).simulate('click');
        expect(props.saveChanges.mock.calls.length).toBe(1);
        expect(props.saveChanges.mock.calls[0][0]).toBe(false);
    });
});
