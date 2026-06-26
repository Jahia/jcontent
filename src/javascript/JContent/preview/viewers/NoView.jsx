import React from 'react';
import clsx from 'clsx';
import {Paper} from '@material-ui/core';
import {Typography} from '@jahia/moonstone';
import {useTranslation} from 'react-i18next';
import styles from './PreviewViewers.scss';

export const NoView = () => {
    const {t} = useTranslation('jcontent');
    return (
        <div className={clsx(styles.noPreviewContainer, styles.contentContainer)}
             data-sel-role="preview-container"
             data-preview-type="no-view"
        >
            <Paper elevation={1} className={styles.contentContainer} classes={{root: styles.center}}>
                <Typography variant="body">
                    {t('jcontent:label.contentManager.contentPreview.noViewAvailable')}
                </Typography>
            </Paper>
        </div>
    );
};
