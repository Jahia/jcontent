import React from 'react';
import PropTypes from 'prop-types';
import {useContentEditorConfigContext, useContentEditorContext} from '~/ContentEditor/contexts';
import {ArrowLeft} from '@jahia/moonstone';

export const TranslateFieldActionComponent = ({field, value, render: Render}) => {
    const {sideBySideContext} = useContentEditorConfigContext();
    const {setI18nContext} = useContentEditorContext();

    const {enabled, translateLang, hasWritePermission, lockedAndCannotBeEdited} = sideBySideContext || {};

    const handleOnClick = () => {
        setI18nContext(prevState => {
            const prev = prevState || {};

            const result = {
                ...prev,
                [translateLang]: {
                    ...prev[translateLang],
                    values: {
                        [field.name]: value
                    },
                    validation: {
                        ...prev[translateLang]?.validation
                    }
                }
            };

            return (value) ? result : prev;
        });
    };

    return (
        <Render
            buttonIcon={<ArrowLeft/>}
            isVisible={Boolean(enabled) && Boolean(field.i18n) && Boolean(translateLang)}
            enabled={Boolean(value) && hasWritePermission && !lockedAndCannotBeEdited}
            dataSelRole="translate-field"
            buttonProps={{
                variant: 'ghost',
                color: 'accent'
            }}
            onClick={handleOnClick}
        />
    );
};

TranslateFieldActionComponent.propTypes = {
    field: PropTypes.object.isRequired,
    value: PropTypes.any,
    render: PropTypes.func.isRequired
};
