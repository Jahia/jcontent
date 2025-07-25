import React from 'react';
import PropTypes from 'prop-types';
import {useContentEditorApiContext} from '../../../contexts';
import {useSelector} from 'react-redux';
import {useNodeChecks} from '@jahia/data-helper';
import {TranslatePanel} from './TranslatePanel';
import {useTranslateFormDefinition} from './useTranslateFormDefinition';

export const TranslateActionComponent = ({path, render: Render, ...otherProps}) => {
    const api = useContentEditorApiContext();
    const lang = useSelector(state => state.language);
    const res = useNodeChecks(
        {path: path, language: lang},
        {...otherProps, getSiteLanguages: true}
    );

    const languages = res.node?.site?.languages?.filter(l => l.activeInEdit) || [];
    const sourceLang = languages.find(l => l.language !== lang) || languages[0];
    return (res.loading) ? null : (
        <Render {...otherProps}
                enabled={languages.length > 2}
                onClick={() => {
                    api.edit({
                        uuid: res.node.uuid,
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

TranslateActionComponent.propTypes = {
    render: PropTypes.func.isRequired,
    path: PropTypes.string.isRequired
};

export const translateAction = {
    component: TranslateActionComponent
};
