import React from 'react';
import classNames from 'classnames';
import {Paper} from '@material-ui/core';
import {Typography} from '@jahia/moonstone';
import {useTranslation} from 'react-i18next';
import styles from '../Preview.scss';

const NoPreviewComponent = () => {
    const {t} = useTranslation();
    return (
        <div className={classNames(styles.noPreviewContainer, styles.contentContainer)}>
            <Paper elevation={1} className={styles.contentContainer} classes={{root: styles.center}}>
                <Typography variant="heading" weight="light">
                    {t('jcontent:label.contentManager.contentPreview.noContentSelected')}
                </Typography>
            </Paper>
        </div>
    );
};

NoPreviewComponent.propTypes = {
};

export default NoPreviewComponent;
