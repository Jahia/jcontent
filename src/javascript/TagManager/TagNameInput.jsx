import React, {useState} from 'react';
import PropTypes from 'prop-types';
import {useTranslation} from 'react-i18next';
import {Button, Close, Input, Search} from '@jahia/moonstone';
import {useTagSuggestions} from './useTagSuggestions';
import {TagSuggestions} from './TagSuggestions';
import styles from './TagManager.scss';

export const TagNameInput = ({siteKey, isOpen, initialValue = '', placeholder, suggestionsLabel, dataCmRole, onChange}) => {
    const {t} = useTranslation('jcontent');
    const [value, setValue] = useState(initialValue);
    const suggestions = useTagSuggestions({siteKey, isOpen, value});

    const handleChange = newValue => {
        setValue(newValue);
        onChange(newValue);
    };

    return (
        <>
            <Input
                autoFocus
                size="big"
                className={styles.renameInput}
                data-cm-role={dataCmRole}
                value={value}
                placeholder={placeholder}
                variant={{interactive: <Search/>}}
                postfixComponents={value ? (
                    <Button
                        icon={<Close/>}
                        variant="ghost"
                        aria-label={t('jcontent:label.contentEditor.edit.fields.actions.clear')}
                        onClick={() => handleChange('')}
                    />
                ) : null}
                onChange={event => handleChange(event.target.value)}
            />
            <TagSuggestions
                label={suggestionsLabel}
                suggestions={suggestions}
                onSelect={handleChange}
            />
        </>
    );
};

TagNameInput.propTypes = {
    siteKey: PropTypes.string.isRequired,
    isOpen: PropTypes.bool.isRequired,
    initialValue: PropTypes.string,
    placeholder: PropTypes.string.isRequired,
    suggestionsLabel: PropTypes.string.isRequired,
    dataCmRole: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired
};
