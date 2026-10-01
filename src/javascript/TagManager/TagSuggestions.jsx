import React from 'react';
import PropTypes from 'prop-types';
import {Button, Typography} from '@jahia/moonstone';
import styles from './TagManager.scss';

export const TagSuggestions = ({label, suggestions, onSelect}) => {
    if (suggestions.length === 0) {
        return null;
    }

    return (
        <div className={styles.suggestionsBlock}>
            <Typography variant="caption" weight="bold">
                {label}
            </Typography>
            <div className={styles.suggestionsList}>
                {suggestions.map(suggestion => (
                    <Button
                        key={suggestion.name}
                        variant="ghost"
                        size="small"
                        label={suggestion.name}
                        onClick={() => onSelect(suggestion.name)}
                    />
                ))}
            </div>
        </div>
    );
};

TagSuggestions.propTypes = {
    label: PropTypes.string.isRequired,
    suggestions: PropTypes.arrayOf(PropTypes.shape({
        name: PropTypes.string.isRequired
    })).isRequired,
    onSelect: PropTypes.func.isRequired
};
