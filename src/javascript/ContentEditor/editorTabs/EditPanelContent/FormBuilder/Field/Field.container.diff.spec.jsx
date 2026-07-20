import React from 'react';
import {shallow} from '@jahia/test-framework';

import {FieldContainer} from './Field.container';
import {registerSelectorTypes} from '~/ContentEditor/SelectorTypes';
import {registry} from '@jahia/ui-extender';
import {useFormikContext} from 'formik';
import {useContentEditorConfigContext} from '~/ContentEditor/contexts';

jest.mock('formik');
jest.mock('~/ContentEditor/contexts', () => ({
    ...jest.requireActual('~/ContentEditor/contexts'),
    useContentEditorConfigContext: jest.fn()
}));
jest.mock('~/JContent/ContentRoute/ContentLayout/ContentTable/reactTable', () => ({}));
jest.mock('~/JContent/ContentRoute/ContentLayout/queryHandlers', () => ({FilesQueryHandler: {}}));
jest.mock('react-dnd-html5-backend', () => ({getEmptyImage: jest.fn().mockReturnValue({})}));

// Side-by-side diff mode (issue #2556): FieldContainer flags a field whose value differs from the
// compared node (sideBySideContext.targetNodeData) with a diff bar class and passes `hasDiff` to the
// translateField action. propertyHasChanged (real) does the comparison.
describe('FieldContainer side-by-side diff', () => {
    registerSelectorTypes(registry);

    const field = {
        name: 'field1',
        propertyName: 'prop',
        nodeType: 'nt',
        requiredType: 'STRING',
        selectorType: 'Text',
        i18n: true,
        selectorOptions: []
    };
    // Compared (live) node has 'live' for this property.
    const targetNodeData = {properties: [{name: 'prop', value: 'live', definition: {declaringNodeType: {name: 'nt'}}}]};
    const diffContext = {enabled: true, showDiff: true, targetNodeData};

    const renderWith = (sideBySideContext, sourceValue) => {
        useFormikContext.mockReturnValue({values: {field1: sourceValue}});
        useContentEditorConfigContext.mockReturnValue({sideBySideContext});
        return shallow(<FieldContainer field={field}/>);
    };

    it('marks a differing field with the diff bar, a non-colour title cue and flags the action', () => {
        const wrapper = renderWith(diffContext, 'source'); // Differs from 'live'
        expect(wrapper.find('DisplayAction').props().hasDiff).toBe(true);
        expect(wrapper.find('div').first().props().className).toContain('fieldContainerDiff');
        // WCAG 1.4.1: the bar (colour) is backed by a title cue on the flagged field.
        expect(wrapper.find('div').first().props().title).toBe('translated_label.contentEditor.edit.action.translate.fieldDiff');
    });

    it('does not mark a field whose value matches the compared node', () => {
        const wrapper = renderWith(diffContext, 'live'); // Equal
        expect(wrapper.find('DisplayAction').props().hasDiff).toBe(false);
        expect(wrapper.find('div').first().props().className).not.toContain('fieldContainerDiff');
        expect(wrapper.find('div').first().props().title).toBeUndefined();
    });

    it('stays inert when showDiff is off (e.g. the plain translate panel)', () => {
        const wrapper = renderWith({enabled: true, targetNodeData}, 'source');
        expect(wrapper.find('DisplayAction').props().hasDiff).toBe(false);
        expect(wrapper.find('div').first().props().className).not.toContain('fieldContainerDiff');
        expect(wrapper.find('div').first().props().title).toBeUndefined();
    });
});
