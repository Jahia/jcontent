import React from 'react';
import MultipleLeftRightSelector from './MultipleLeftRightSelector';
import {mount} from '@jahia/test-framework';

describe('MultipleLeftRightSelector component', () => {
    let props;
    const onChange = jest.fn();

    beforeEach(() => {
        MultipleLeftRightSelector.propTypes = {};
        props = {
            onChange,
            id: 'MultipleLeftRightSelector',
            field: {
                displayName: 'My Colors',
                name: 'colors',
                readOnly: false,
                multiple: true,
                selectorType: 'MultipleLeftRightSelector',
                valueConstraints: []
            },
            value: ['blue', 'red']
        };
    });

    it('should render selector and call onChange when value does not match options ', () => {
        // Remove red from the options but still present in values
        props.field.valueConstraints = [
            {displayValue: 'Blue', value: {string: 'blue'}},
            {displayValue: 'Green', value: {string: 'green'}}
        ];
        const cmp = mount(<MultipleLeftRightSelector {...props}/>);

        // Red should be removed and onChange has been called
        expect(onChange).toHaveBeenCalledWith(['blue']);
        expect(cmp.find('MultipleLeftRightSelector').exists()).toBe(true);
    });
});
