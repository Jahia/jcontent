import React from 'react';
import {shallow} from 'enzyme';
import {IconButton} from '@jahia/ds-mui-theme';

import RotatePanel from './RotatePanel';

describe('Rotate panel', () => {
    let props;
    let wrapper;

    beforeEach(() => {
        try {
            props = {
                dirty: false,
                expanded: true,
                disabled: false,
                undoChanges: jest.fn(),
                saveChanges: jest.fn(),
                rotate: jest.fn(),
                onChangePanel: jest.fn()
            };

            wrapper = shallow(<RotatePanel {...props}/>);
            wrapper = wrapper.dive().dive();
        } catch (e) {
            console.log(e);
        }
    });

    it('Should rotate the image', () => {
        wrapper.find(IconButton).last().simulate('click');
        expect(props.rotate.mock.calls.length).toBe(1);
        expect(props.rotate.mock.calls[0][0]).toBe(1);

        wrapper.find(IconButton).first().simulate('click');
        expect(props.rotate.mock.calls.length).toBe(2);
        expect(props.rotate.mock.calls[1][0]).toBe(-1);
    });

});
