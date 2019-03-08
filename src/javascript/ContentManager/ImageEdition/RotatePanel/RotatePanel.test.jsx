import React from 'react';
import {shallow} from 'enzyme';
import {
    ExpansionPanel,
    ExpansionPanelDetails,
    ExpansionPanelSummary,
    IconButton,
    Tooltip,
    withStyles
} from '@material-ui/core';

import RotatePanel from './RotatePanel';

describe('Rotate panel', () => {
    let props;
    let wrapper;

    beforeEach(() => {
        try {
            wrapper = shallow(
                <RotatePanel
                    dirty={false}
                    expanded={true}
                    defaultExpanded={true}
                    disabled={false}
                    undoChanges={jest.fn()}
                    saveChanges={jest.fn()}
                    rotate={jest.fn()}
                    onChangePanel={jest.fn()}
                />
            );
            wrapper = wrapper.dive().dive();
        } catch (e) {
            console.log(e);
        }
    });

    it('should contain 3 ', () => {
        expect(wrapper.find(Tooltip).length).toBe(1);
        expect(wrapper.find(IconButton).length).toBe(2);
    });

});
