import React, {useContext} from 'react';
import {shallowWithTheme} from '@jahia/test-framework';
import {dsGenericTheme} from '@jahia/design-system-kit';
import {CopyLanguageActionComponent} from './copyLanguageAction';
import {useContentEditorContext} from '~/ContentEditor/contexts/ContentEditor';

jest.mock('react', () => {
    return {
        ...jest.requireActual('react'),
        useContext: jest.fn(() => ({}))
    };
});

jest.mock('~/ContentEditor/contexts/ContentEditor/ContentEditor.context');

describe('copy language action', () => {
    let defaultProps;
    let contentEditorContext;
    beforeEach(() => {
        contentEditorContext = {
            nodeData: {
                uuid: '12345-321456-1234565789',
                hasWritePermission: true
            },
            lang: 'fr',
            siteInfo: {
                languages: [
                    {displayName: 'Deutsch', language: 'de', activeInEdit: true},
                    {displayName: 'Français', language: 'fr', activeInEdit: true}
                ]
            }
        };
        useContentEditorContext.mockReturnValue(contentEditorContext);
        defaultProps = {
            render: () => ''
        };
    });

    it('should render not be enabled when the user has no write access', () => {
        contentEditorContext.nodeData.hasWritePermission = false;
        const cmp = shallowWithTheme(
            <CopyLanguageActionComponent {...defaultProps}/>,
            {},
            dsGenericTheme
        );

        expect(cmp.props().enabled).toBeFalsy();
    });

    it('should render not be enabled when the node is locked', () => {
        contentEditorContext.nodeData.lockedAndCannotBeEdited = true;
        const cmp = shallowWithTheme(
            <CopyLanguageActionComponent {...defaultProps}/>,
            {},
            dsGenericTheme
        );

        expect(cmp.props().enabled).toBeFalsy();
    });

    it('should be visible when there is more than one language', () => {
        const cmp = shallowWithTheme(
            <CopyLanguageActionComponent {...defaultProps}/>,
            {},
            dsGenericTheme
        );

        expect(cmp.props().isVisible).toBeTruthy();
    });

    it('should not be visible when there is only one language', () => {
        contentEditorContext.language = 'en';
        contentEditorContext.siteInfo.languages = [
            {displayName: 'English', language: 'en', activeInEdit: true}
        ];
        const cmp = shallowWithTheme(<CopyLanguageActionComponent {...defaultProps}/>,
            {},
            dsGenericTheme
        );

        expect(cmp.props().isVisible).toBeFalsy();
    });

    it('should destroy copy language dialog when onCloseDialog has been called', () => {
        let render = jest.fn();
        let destroy = jest.fn();

        useContext.mockImplementation(() => ({render: render, destroy: destroy}));

        const cmp = shallowWithTheme(
            <CopyLanguageActionComponent {...defaultProps}/>,
            {},
            dsGenericTheme
        );

        cmp.props().onClick();
        const onCloseDialog = render.mock.calls[0][2].onCloseDialog;
        onCloseDialog();

        expect(destroy).toHaveBeenCalled();
    });
});
