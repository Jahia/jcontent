import React from 'react';
import {Typography} from '@jahia/moonstone';
import {useTranslation} from 'react-i18next';
import styles from './selectors.scss';
import PropTypes from 'prop-types';

export const SelectorLabel = ({name}) => {
    const {t} = useTranslation('jcontent');
    const labelPrefix = 'jcontent:label.contentManager.actions.customizedPreview.dialog';
    return (
        <>
            <Typography variant="subheading" weight="bold" data-sel-role={`${name}-selector-label`}>
                {t(`${labelPrefix}.${name}Label`)}
            </Typography>
            <Typography className={styles.label} variant="caption" data-sel-role={`${name}-selector-description`}>
                {t(`${labelPrefix}.${name}Description`)}
            </Typography>
        </>
    );
};

SelectorLabel.propTypes = {
    name: PropTypes.string.isRequired
};
