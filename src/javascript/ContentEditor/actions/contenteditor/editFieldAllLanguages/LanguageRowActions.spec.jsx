import React from 'react';
import {shallowWithTheme} from '@jahia/test-framework';
import {dsGenericTheme} from '@jahia/design-system-kit';
import {registry} from '@jahia/ui-extender';
import {LanguageRowActions, ROW_ACTIONS_MENU, ROW_ACTIONS_TARGET} from './LanguageRowActions';

jest.mock('@jahia/ui-extender', () => ({
    registry: {find: jest.fn()},
    DisplayAction: () => '',
    DisplayActions: () => ''
}));

describe('LanguageRowActions', () => {
    let defaultProps;

    beforeEach(() => {
        defaultProps = {
            field: {name: 'title', displayName: 'Title', i18n: true},
            language: 'fr',
            sourceLanguage: 'en',
            isSourceLanguage: false,
            isReadOnly: false,
            hasSourceValue: true,
            nodeUuid: '12345-321456-1234565789',
            editorContext: {lang: 'en', nodeData: {uuid: '12345-321456-1234565789'}},
            getValue: jest.fn(),
            getSourceValue: jest.fn(),
            onSetValue: jest.fn()
        };
    });

    const build = () => shallowWithTheme(<LanguageRowActions {...defaultProps}/>, {}, dsGenericTheme);

    it('should keep the extension point target stable - modules register against it', () => {
        expect(ROW_ACTIONS_TARGET).toBe('content-editor/field/all-languages/row-actions');
        expect(ROW_ACTIONS_MENU).toBe('content-editor/field/all-languages/row-3dots');
    });

    it('should render nothing when no module contributed an action', () => {
        registry.find.mockReturnValue([]);

        expect(build().isEmptyRender()).toBe(true);
    });

    it('should render a single button when exactly one action is registered', () => {
        registry.find.mockReturnValue([{key: 'aiTranslate'}]);
        const cmp = build();

        expect(cmp.find('DisplayActions').exists()).toBe(true);
        expect(cmp.find('DisplayActions').props().target).toBe(ROW_ACTIONS_TARGET);
        expect(cmp.find('DisplayAction').exists()).toBe(false);
    });

    it('should collapse into the 3 dots menu as soon as a second action is registered', () => {
        registry.find.mockReturnValue([{key: 'aiTranslate'}, {key: 'glossaryLookup'}]);
        const cmp = build();

        expect(cmp.find('DisplayAction').exists()).toBe(true);
        expect(cmp.find('DisplayAction').props().actionKey).toBe(ROW_ACTIONS_MENU);
        expect(cmp.find('DisplayActions').exists()).toBe(false);
    });

    it('should pass the whole row context down to the actions', () => {
        registry.find.mockReturnValue([{key: 'aiTranslate'}]);
        const props = build().find('DisplayActions').props();

        expect(props.field).toBe(defaultProps.field);
        expect(props.language).toBe('fr');
        expect(props.sourceLanguage).toBe('en');
        expect(props.isReadOnly).toBe(false);
        expect(props.hasSourceValue).toBe(true);
        expect(props.nodeUuid).toBe(defaultProps.nodeUuid);
        expect(props.getValue).toBe(defaultProps.getValue);
        expect(props.getSourceValue).toBe(defaultProps.getSourceValue);
        expect(props.onSetValue).toBe(defaultProps.onSetValue);
    });

    it('should pass the same row context down when collapsed into the menu', () => {
        registry.find.mockReturnValue([{key: 'aiTranslate'}, {key: 'glossaryLookup'}]);
        const props = build().find('DisplayAction').props();

        expect(props.language).toBe('fr');
        expect(props.onSetValue).toBe(defaultProps.onSetValue);
    });
});
