import React from 'react';
import {shallow} from '@jahia/test-framework';

import {FieldContainer} from './Field.container';
import {registerSelectorTypes} from '~/ContentEditor/SelectorTypes';
import {registry} from '@jahia/ui-extender';
import {useFormikContext} from 'formik';

jest.mock('formik');
jest.mock('~/JContent/ContentRoute/ContentLayout/ContentTable/reactTable', () => ({}));
jest.mock('~/JContent/ContentRoute/ContentLayout/queryHandlers', () => {
    return {
        FilesQueryHandler: {}
    };
});
jest.mock('react-dnd-html5-backend', () => {
    return {
        getEmptyImage: jest.fn().mockReturnValue({})
    };
});

describe('Field container component', () => {
    registerSelectorTypes(registry);

    let defaultProps;
    beforeEach(() => {
        defaultProps = {
            field: {
                name: 'x',
                displayName: 'displayName',
                selectorType: 'RichText',
                readOnly: false,
                selectorOptions: []
            },
            targets: [{name: 'test'}],
            editorContext: {}
        };
        useFormikContext.mockReturnValue({
            values: {x: 'testValue'}
        });
    });

    it('should render a Text component when field type is "Text"', () => {
        defaultProps.field.selectorType = 'Text';
        const cmp = shallow(<FieldContainer {...defaultProps}/>).find('Field');
        expect(cmp.props().selectorType.key).toBe('Text');
    });

    it('should render a RichText component when field type is "RichText"', () => {
        const cmp = shallow(<FieldContainer {...defaultProps}/>).find('Field');
        expect(cmp.props().selectorType.key).toBe('RichText');
    });

    it('should render a default ContentPicker component when field type is "picker" with no option', () => {
        defaultProps.field.selectorType = 'Picker';
        const cmp = shallow(<FieldContainer {...defaultProps}/>).find('Field');
        expect(cmp.props().selectorType.pickerConfig.key).toBe('default');
    });

    it('should render a MediaPicker component when field type is "picker" and option type is "image"', () => {
        defaultProps.field.selectorType = 'Picker';
        defaultProps.field.selectorOptions = [{name: 'type', value: 'image'}];

        const cmp = shallow(<FieldContainer {...defaultProps}/>).find('Field');
        expect(cmp.props().selectorType.pickerConfig.key).toBe('image');
    });
});
