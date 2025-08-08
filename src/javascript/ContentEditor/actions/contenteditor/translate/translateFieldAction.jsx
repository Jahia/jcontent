import React from 'react';
import PropTypes from 'prop-types';
import {useContentEditorConfigContext, useContentEditorContext} from '~/ContentEditor/contexts';
import {ArrowRight} from '@jahia/moonstone';
import styles from './styles.scss';

export const TranslateFieldActionComponent = ({field, value, render: Render}) => {
    const {sideBySideContext} = useContentEditorConfigContext();
    const {setI18nContext} = useContentEditorContext();

    const {enabled, translateLang, hasWritePermission, lockedAndCannotBeEdited} = sideBySideContext || {};
    if (!enabled || !field.i18n || !translateLang) {
        return <div className={styles.spacing}/>;
    }

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
        <div className={styles.translate}>
            <Render
              buttonIcon={<ArrowRight/>}
              enabled={Boolean(value) && hasWritePermission && !lockedAndCannotBeEdited}
              dataSelRole="translate-field"
              buttonProps={{
                  variant: 'ghost',
                  color: 'accent'
              }}
              onClick={handleOnClick}
          />
        </div>
    );
};

TranslateFieldActionComponent.propTypes = {
    field: PropTypes.object.isRequired,
    value: PropTypes.any,
    render: PropTypes.func.isRequired
};

export const translateFieldAction = {
    component: TranslateFieldActionComponent
};
