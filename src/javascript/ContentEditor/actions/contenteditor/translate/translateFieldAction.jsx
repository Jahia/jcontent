import React from 'react';
import {useContentEditorConfigContext, useContentEditorContext} from '~/ContentEditor/contexts';
import {ArrowRight} from '@jahia/moonstone';
import styles from './styles.scss';

export const TranslateFieldActionComponent = ({field, value, render: Render}) => {
    const {translateLang, readOnly} = useContentEditorConfigContext();
    const {setI18nContext} = useContentEditorContext();

    if (!readOnly || !field.i18n || !translateLang) {
        return null;
    }


    const handleOnClick = (props, e) => {
        setI18nContext(prevState => {
            const prev = prevState || {};
            console.debug('clicked translate field action', field.name);

            const result = {
                ...prev,
                [translateLang]: {
                    ...prev[translateLang],
                    values: {
                        ...prev[translateLang]?.values,
                        [field.name]: value
                    },
                    validation: {
                        ...prev[translateLang]?.validation
                    }
                }
            }

            return (value) ? result : prev;
        });
    };

    return (
        <div className={styles.translate}>
          <Render
              buttonIcon={<ArrowRight/>}
              onClick={handleOnClick}
              enabled={!!value}
              aria-label="translate-field"
              variant="ghost"
          />
        </div>
    );
};

export const translateFieldAction = {
    component: TranslateFieldActionComponent
};
