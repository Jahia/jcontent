import React from 'react';
import {shallowWithTheme} from '@jahia/test-framework';
import {dsGenericTheme} from '@jahia/design-system-kit';
import {EditFieldAllLanguagesActionComponent} from './editFieldAllLanguagesAction';
import {useContentEditorConfigContext, useContentEditorContext, useContentEditorSectionContext} from '~/ContentEditor/contexts';
import {useFormikContext} from 'formik';

jest.mock('react', () => {
    return {
        ...jest.requireActual('react'),
        useContext: jest.fn(() => ({}))
    };
});
jest.mock('formik');
jest.mock('~/ContentEditor/contexts/ContentEditor/ContentEditor.context');
jest.mock('~/ContentEditor/contexts/ContentEditorConfig/ContentEditorConfig.context');
jest.mock('~/ContentEditor/contexts/ContentEditorSection/ContentEditorSection.context');

// Named so the action's button can be told apart from the confirmation dialog in the shallow tree.
const RenderMock = () => '';

describe('editFieldAllLanguagesAction', () => {
    let defaultProps;
    let editorContext;
    let componentRenderer;
    let formik;

    beforeEach(() => {
        defaultProps = {
            render: RenderMock,
            field: {name: 'title', displayName: 'Title', i18n: true, readOnly: false, visible: true, selectorOptions: []}
        };

        editorContext = {
            mode: 'edit',
            lang: 'en',
            nodeData: {
                uuid: '12345-321456-1234565789',
                hasWritePermission: true,
                lockedAndCannotBeEdited: false
            },
            siteInfo: {
                languages: [
                    {language: 'en', activeInEdit: true},
                    {language: 'fr', activeInEdit: true}
                ]
            }
        };
        useContentEditorContext.mockReturnValue(editorContext);
        useContentEditorConfigContext.mockReturnValue({});
        useContentEditorSectionContext.mockReturnValue({
            sections: [{
                name: 'content',
                fieldSets: [{
                    visible: true,
                    dynamic: false,
                    fields: [
                        defaultProps.field,
                        {name: 'summary', displayName: 'Summary', i18n: false, visible: true, selectorOptions: []},
                        {name: 'secret', displayName: 'Secret', i18n: true, visible: true, selectorOptions: [{name: 'password', value: 'true'}]},
                        {name: 'hiddenField', displayName: 'Hidden', i18n: true, visible: false, selectorOptions: []}
                    ]
                }]
            }]
        });

        formik = {setFieldValue: jest.fn(), values: {}};
        useFormikContext.mockReturnValue(formik);

        componentRenderer = {render: jest.fn(), destroy: jest.fn()};
        React.useContext.mockImplementation(() => componentRenderer);
    });

    it('is visible for an i18n field when there is more than one language', () => {
        const cmp = shallowWithTheme(
            <EditFieldAllLanguagesActionComponent {...defaultProps}/>,
            {},
            dsGenericTheme
        );

        expect(cmp.find('RenderMock').props().isVisible).toBe(true);
    });

    it('is not visible for a non-i18n field', () => {
        defaultProps.field.i18n = false;
        const cmp = shallowWithTheme(
            <EditFieldAllLanguagesActionComponent {...defaultProps}/>,
            {},
            dsGenericTheme
        );

        expect(cmp.find('RenderMock').props().isVisible).toBe(false);
    });

    it('is not visible when there is only one language', () => {
        editorContext.siteInfo.languages = [{language: 'en', activeInEdit: true}];
        const cmp = shallowWithTheme(
            <EditFieldAllLanguagesActionComponent {...defaultProps}/>,
            {},
            dsGenericTheme
        );

        expect(cmp.find('RenderMock').props().isVisible).toBe(false);
    });

    it('is not visible for a password field', () => {
        defaultProps.field.selectorOptions = [{name: 'password', value: 'true'}];
        const cmp = shallowWithTheme(
            <EditFieldAllLanguagesActionComponent {...defaultProps}/>,
            {},
            dsGenericTheme
        );

        expect(cmp.find('RenderMock').props().isVisible).toBe(false);
    });

    it('is not visible while creating new content', () => {
        editorContext.mode = 'create';
        const cmp = shallowWithTheme(
            <EditFieldAllLanguagesActionComponent {...defaultProps}/>,
            {},
            dsGenericTheme
        );

        expect(cmp.find('RenderMock').props().isVisible).toBe(false);
    });

    it('is not visible when already rendering inside one of its own modal rows', () => {
        useContentEditorConfigContext.mockReturnValue({allLanguagesEditContext: {enabled: true}});
        const cmp = shallowWithTheme(
            <EditFieldAllLanguagesActionComponent {...defaultProps}/>,
            {},
            dsGenericTheme
        );

        expect(cmp.find('RenderMock').props().isVisible).toBe(false);
    });

    it('is not enabled when the node is locked', () => {
        editorContext.nodeData.lockedAndCannotBeEdited = true;
        const cmp = shallowWithTheme(
            <EditFieldAllLanguagesActionComponent {...defaultProps}/>,
            {},
            dsGenericTheme
        );

        expect(cmp.find('RenderMock').props().enabled).toBe(false);
    });

    it('opens the modal on click', () => {
        const cmp = shallowWithTheme(
            <EditFieldAllLanguagesActionComponent {...defaultProps}/>,
            {},
            dsGenericTheme
        );

        cmp.find('RenderMock').props().onClick();

        expect(componentRenderer.render).toHaveBeenCalledWith(
            'editFieldAllLanguagesModal',
            expect.anything(),
            expect.objectContaining({field: defaultProps.field, uuid: editorContext.nodeData.uuid})
        );
    });

    it('orders languages with the current language first, then the rest alphabetically', () => {
        editorContext.lang = 'fr';
        editorContext.siteInfo.languages = [
            {language: 'en', activeInEdit: true},
            {language: 'es', activeInEdit: true},
            {language: 'fr', activeInEdit: true},
            {language: 'de', activeInEdit: true}
        ];

        const cmp = shallowWithTheme(
            <EditFieldAllLanguagesActionComponent {...defaultProps}/>,
            {},
            dsGenericTheme
        );

        cmp.find('RenderMock').props().onClick();
        const {languages} = componentRenderer.render.mock.calls[0][2];

        expect(languages.map(l => l.language)).toEqual(['fr', 'de', 'en', 'es']);
    });

    it('excludes password and hidden fields from the field switcher, keeps other content-section fields', () => {
        const cmp = shallowWithTheme(
            <EditFieldAllLanguagesActionComponent {...defaultProps}/>,
            {},
            dsGenericTheme
        );

        cmp.find('RenderMock').props().onClick();
        const {fields} = componentRenderer.render.mock.calls[0][2];

        expect(fields.map(f => f.name)).toEqual(['title', 'summary']);
    });

    const withSeoSection = ({isSeoVisible = true} = {}) => {
        useContentEditorSectionContext.mockReturnValue({
            sections: [
                {
                    name: 'content',
                    fieldSets: [{visible: true, dynamic: false, fields: [defaultProps.field]}]
                },
                {
                    name: 'seo',
                    visible: isSeoVisible,
                    fieldSets: [{
                        visible: true,
                        dynamic: false,
                        fields: [{name: 'jcr:description', displayName: 'Description', i18n: true, visible: true, selectorOptions: []}]
                    }]
                },
                {
                    name: 'options',
                    visible: true,
                    fieldSets: [{
                        visible: true,
                        dynamic: false,
                        fields: [{name: 'someOption', displayName: 'Option', i18n: true, visible: true, selectorOptions: []}]
                    }]
                }
            ]
        });
    };

    const openedFields = () => {
        const cmp = shallowWithTheme(
            <EditFieldAllLanguagesActionComponent {...defaultProps}/>,
            {},
            dsGenericTheme
        );

        cmp.find('RenderMock').props().onClick();
        return componentRenderer.render.mock.calls[0][2].fields.map(f => f.name);
    };

    it('offers the SEO fields when the node is rendered as a page', () => {
        editorContext.nodeData.isRenderedAsPage = true;
        withSeoSection();

        expect(openedFields()).toEqual(['title', 'jcr:description']);
    });

    it('does not offer the SEO fields when the node is not rendered as a page', () => {
        editorContext.nodeData.isRenderedAsPage = false;
        withSeoSection();

        expect(openedFields()).toEqual(['title']);
    });

    it('does not offer the SEO fields when the SEO section is hidden or not permitted', () => {
        editorContext.nodeData.isRenderedAsPage = true;
        withSeoSection({isSeoVisible: false});

        expect(openedFields()).toEqual(['title']);
    });

    it('never offers fields from sections other than content and SEO', () => {
        editorContext.nodeData.isRenderedAsPage = true;
        withSeoSection();

        expect(openedFields()).not.toContain('someOption');
    });

    it('excludes fields from a not-yet-activated dynamic fieldSet', () => {
        useContentEditorSectionContext.mockReturnValue({
            sections: [{
                name: 'content',
                fieldSets: [
                    {visible: true, dynamic: false, fields: [defaultProps.field]},
                    {visible: true, dynamic: true, name: 'jmix:tagged', hasEnableSwitch: true, activated: false, fields: [{name: 'tags', displayName: 'Tags', i18n: true, visible: true, selectorOptions: []}]}
                ]
            }]
        });

        const cmp = shallowWithTheme(
            <EditFieldAllLanguagesActionComponent {...defaultProps}/>,
            {},
            dsGenericTheme
        );

        cmp.find('RenderMock').props().onClick();
        const {fields} = componentRenderer.render.mock.calls[0][2];

        expect(fields.map(f => f.name)).toEqual(['title']);
    });

    it('includes fields from an activated dynamic fieldSet', () => {
        formik.values = {'jmix:tagged': true};
        useContentEditorSectionContext.mockReturnValue({
            sections: [{
                name: 'content',
                fieldSets: [
                    {visible: true, dynamic: false, fields: [defaultProps.field]},
                    {visible: true, dynamic: true, name: 'jmix:tagged', hasEnableSwitch: true, activated: false, fields: [{name: 'tags', displayName: 'Tags', i18n: true, visible: true, selectorOptions: []}]}
                ]
            }]
        });

        const cmp = shallowWithTheme(
            <EditFieldAllLanguagesActionComponent {...defaultProps}/>,
            {},
            dsGenericTheme
        );

        cmp.find('RenderMock').props().onClick();
        const {fields} = componentRenderer.render.mock.calls[0][2];

        expect(fields.map(f => f.name)).toEqual(['title', 'tags']);
    });

    it('reflects a saved value for the active language back onto the main editor form', () => {
        const cmp = shallowWithTheme(
            <EditFieldAllLanguagesActionComponent {...defaultProps}/>,
            {},
            dsGenericTheme
        );

        cmp.find('RenderMock').props().onClick();
        const {onSaved} = componentRenderer.render.mock.calls[0][2];
        onSaved(defaultProps.field, {en: 'new value', fr: 'valeur'});

        expect(formik.setFieldValue).toHaveBeenCalledWith('title', 'new value');
    });

    it('destroys the modal when onClose is called', () => {
        const cmp = shallowWithTheme(
            <EditFieldAllLanguagesActionComponent {...defaultProps}/>,
            {},
            dsGenericTheme
        );

        cmp.find('RenderMock').props().onClick();
        const {onClose} = componentRenderer.render.mock.calls[0][2];
        onClose();

        expect(componentRenderer.destroy).toHaveBeenCalledWith('editFieldAllLanguagesModal');
    });

    describe('unsaved changes in the content editor', () => {
        const build = () => shallowWithTheme(
            <EditFieldAllLanguagesActionComponent {...defaultProps}/>,
            {},
            dsGenericTheme
        );
        const confirmation = cmp => cmp.find('CloseConfirmationDialog');

        beforeEach(() => {
            useContentEditorConfigContext.mockReturnValue({confirmationDialog: true});
            formik.dirty = true;
            formik.resetForm = jest.fn();
            formik.validateForm = jest.fn();
            editorContext.i18nContext = {};
            editorContext.resetI18nContext = jest.fn();
        });

        it('opens the modal straight away when nothing is unsaved', () => {
            formik.dirty = false;
            const cmp = build();

            cmp.find('RenderMock').props().onClick();

            expect(componentRenderer.render).toHaveBeenCalled();
            expect(confirmation(cmp).props().isOpen).toBe(false);
        });

        it('asks what to do instead of opening the modal when there are unsaved changes', () => {
            const cmp = build();

            cmp.find('RenderMock').props().onClick();

            expect(componentRenderer.render).not.toHaveBeenCalled();
            expect(cmp.find('CloseConfirmationDialog').props().isOpen).toBe(true);
        });

        it('also asks when only another language was edited', () => {
            formik.dirty = false;
            editorContext.i18nContext = {fr: {values: {title: 'edited'}}};
            const cmp = build();

            cmp.find('RenderMock').props().onClick();

            expect(componentRenderer.render).not.toHaveBeenCalled();
        });

        it('uses its own wording rather than the close-the-editor one', () => {
            const cmp = build();

            expect(confirmation(cmp).props().titleKey)
                .toBe('jcontent:label.contentEditor.edit.action.editAllLanguages.unsavedChanges.title');
            expect(confirmation(cmp).props().messageKey)
                .toBe('jcontent:label.contentEditor.edit.action.editAllLanguages.unsavedChanges.message');
        });

        it('opens the modal once the changes were saved from the dialog', () => {
            const cmp = build();

            confirmation(cmp).props().actionCallback({});

            expect(componentRenderer.render).toHaveBeenCalled();
            expect(formik.resetForm).not.toHaveBeenCalled();
        });

        it('puts the editor form back to the saved content when the changes are discarded', () => {
            const cmp = build();

            confirmation(cmp).props().actionCallback({discard: true});

            expect(formik.resetForm).toHaveBeenCalled();
            expect(editorContext.resetI18nContext).toHaveBeenCalled();
            expect(componentRenderer.render).toHaveBeenCalled();
        });

        it('never asks when the editor has confirmation dialogs turned off', () => {
            useContentEditorConfigContext.mockReturnValue({confirmationDialog: false});
            const cmp = build();

            cmp.find('RenderMock').props().onClick();

            expect(componentRenderer.render).toHaveBeenCalled();
            expect(confirmation(cmp).exists()).toBe(false);
        });
    });
});
