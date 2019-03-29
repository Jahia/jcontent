import React from 'react';
import {shallow} from '@jahia/test-framework';

import ImageEditorActions from './ImageEditorActions';
import {Button} from '@jahia/ds-mui-theme';

describe('Image actions', () => {
    let props;
    let wrapper;

    beforeEach(() => {
        try {
            props = {
                dirty: false,
                undoChanges: jest.fn(),
                saveChanges: jest.fn()
            };

            wrapper = shallow(<ImageEditorActions {...props}/>);
            wrapper = wrapper.dive().dive();
        } catch (e) {
            console.log(e);
        }
    });

    it('should have disabled buttons', () => {
        expect(wrapper.find(Button).everyWhere(n => n.prop('disabled'))).toBeTruthy();
    });

    it('should have enabled buttons', () => {
        wrapper.setProps({dirty: true});
        expect(wrapper.find(Button).everyWhere(n => !n.prop('disabled'))).toBeTruthy();
    });

    it('should undo changes', () => {
        wrapper.setProps({dirty: true});
        wrapper.find(Button).at(0).simulate('click');
        expect(props.undoChanges.mock.calls.length).toBe(1);
    });

    it('should save changes', () => {
        wrapper.setProps({dirty: true});
        wrapper.find(Button).at(1).simulate('click');
        expect(props.saveChanges.mock.calls.length).toBe(1);
        expect(props.saveChanges.mock.calls[0][0]).toBe(true);
    });

    it('should save as changes', () => {
        wrapper.setProps({dirty: true});
        wrapper.find(Button).at(2).simulate('click');
        expect(props.saveChanges.mock.calls.length).toBe(1);
        expect(props.saveChanges.mock.calls[0][0]).toBe(false);
    });

});
