import React from 'react';
import PropTypes from 'prop-types';
import {Button} from '@jahia/moonstone';
import styles from '../UploadItem.scss';
import {useTranslation} from 'react-i18next';

const RetryButton = ({doUploadAndStatusUpdate}) => {
    const {t} = useTranslation();
    return (
        <Button
            key="retry"
            isReversed
            size="big"
            className={styles.actionButton}
            component="a"
            variant="ghost"
            label={t('jcontent:label.contentManager.fileUpload.retry')}
            onClick={() => doUploadAndStatusUpdate()}
        />
    );
};

RetryButton.propTypes = {
    doUploadAndStatusUpdate: PropTypes.func.isRequired
};

export default RetryButton;
