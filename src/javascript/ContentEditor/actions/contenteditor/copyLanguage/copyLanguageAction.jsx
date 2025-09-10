import React, {useContext} from 'react';
import PropTypes from 'prop-types';
import {CopyLanguageDialog} from './CopyLanguageDialog';
import {getFullLanguageName} from './copyLanguage.utils';
import {ComponentRendererContext} from '@jahia/ui-extender';
import {useContentEditorContext, useContentEditorConfigContext} from '~/ContentEditor/contexts';
import {useFormikContext} from 'formik';

export const CopyLanguageActionComponent = ({render: Render, ...otherProps}) => {
    const {render, destroy} = useContext(ComponentRendererContext);
    const {mode, nodeData, lang, siteInfo} = useContentEditorContext();
    const {sideBySideContext} = useContentEditorConfigContext();
    const formik = useFormikContext();
    const availableLanguages = siteInfo.languages.filter(l => l.language !== lang && nodeData.translationLanguages?.includes(l.language));

    return (
        <Render {...otherProps}
                enabled={mode !== 'create'}
                isVisible={siteInfo.languages.length > 1 && nodeData.hasWritePermission && !nodeData.lockedAndCannotBeEdited}
                onClick={() => {
                    render('CopyLanguageDialog', CopyLanguageDialog, {
                        isOpen: true,
                        uuid: nodeData.uuid,
                        formik,
                        language: getFullLanguageName(siteInfo.languages, lang),
                        sideBySideContext,
                        availableLanguages,
                        defaultLanguage: siteInfo.defaultLanguage,
                        onCloseDialog: () => destroy('CopyLanguageDialog')
                    });
                }}/>
    );
};

CopyLanguageActionComponent.propTypes = {
    render: PropTypes.func.isRequired
};

export const copyLanguageAction = {
    component: CopyLanguageActionComponent
};
