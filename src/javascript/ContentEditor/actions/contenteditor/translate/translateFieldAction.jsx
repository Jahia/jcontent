import React from 'react';
import PropTypes from 'prop-types';
import {useContentEditorConfigContext, useContentEditorContext} from '~/ContentEditor/contexts';
import {ArrowLeft} from '@jahia/moonstone';
import styles from './styles.scss';

export const TranslateFieldActionComponent = ({field, value, hasDiff, render: Render}) => {
    const {sideBySideContext} = useContentEditorConfigContext();
    const {setI18nContext} = useContentEditorContext();

    const {enabled, translateLang, hasWritePermission, lockedAndCannotBeEdited, showDiff} = sideBySideContext || {};
    if (!enabled || !field.i18n || !translateLang) {
        return;
    }

    // In diff mode (issue #2556) the restore arrow is shown only where the value differs from the
    // compared node — copying an identical value would be a no-op. Outside diff mode the arrow keeps
    // showing on every valued field (unchanged Translate-tab behaviour).
    if (showDiff && !hasDiff) {
        return;
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
              buttonIcon={<ArrowLeft/>}
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
    hasDiff: PropTypes.bool,
    render: PropTypes.func.isRequired
};

export const translateFieldAction = {
    component: TranslateFieldActionComponent
};
