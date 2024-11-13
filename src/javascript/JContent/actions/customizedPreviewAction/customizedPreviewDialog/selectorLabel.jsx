import React from 'react';
import {Typography} from '@jahia/moonstone';
import {useTranslation} from 'react-i18next';
import styles from './selectors.scss';

export const SelectorLabel = ({name}) => {
    const {t} = useTranslation('jcontent');
    const labelPrefix = 'jcontent:label.contentManager.actions.customizedPreview.dialog';
    return (
        <>
            <Typography variant="subheading" weight="bold">
                {t(`${labelPrefix}.${name}Label`)}
            </Typography>
            <Typography className={styles.label} variant="caption">
                {t(`${labelPrefix}.${name}Description`)}
            </Typography>
        </>
    );
};
