import React from 'react';
import PropTypes from 'prop-types';
import {Button} from '@jahia/moonstone';
import styles from '../UploadItem.scss';

const RetryButton = ({t, doUploadAndStatusUpdate}) => (
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

RetryButton.propTypes = {
    t: PropTypes.func.isRequired,
    doUploadAndStatusUpdate: PropTypes.func.isRequired
};

export default RetryButton;
