import {Button} from '@material-ui/core';
import React from 'react';

const RetryButton = ({t, classes, doUploadAndStatusUpdate}) => (
    <Button
        key="retry"
        className={classes.actionButton}
        component="a"
        size="small"
        onClick={() => doUploadAndStatusUpdate()}
    >
        {t('label.contentManager.fileUpload.retry')}
    </Button>
);

export default RetryButton;
