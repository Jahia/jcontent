import React from 'react';
import PropTypes from 'prop-types';
import {useContentEditorApiContext, useContentEditorContext} from '~/ContentEditor/contexts';
import {TranslatePanel} from './TranslatePanel';
import {useTranslateFormDefinition} from './useTranslateFormDefinition';

export const TranslateEditActionComponent = ({path, render: Render, ...otherProps}) => {
    const api = useContentEditorApiContext();
    const {nodeData, lang, siteInfo, refetchFormData} = useContentEditorContext();

    const languages = siteInfo.languages?.filter(l => l.activeInEdit) || [];
    const sourceLang = languages.find(l => l.language !== lang) || languages[0];

    return (
        <Render {...otherProps}
                isVisible={languages.length > 1}
                onClick={() => {
                    api.edit({
                        uuid: nodeData.uuid,
                        lang: sourceLang.language,
                        isFullscreen: true,
                        dialogProps: {
                            classes: {}
                        },
                        sideBySideContext: {lang},
                        layout: TranslatePanel,
                        useFormDefinition: useTranslateFormDefinition
                    });
                }}
        />
    );
};

TranslateEditActionComponent.propTypes = {
    render: PropTypes.func.isRequired,
    path: PropTypes.string.isRequired
};

export const translateEditAction = {
    component: TranslateEditActionComponent
};
