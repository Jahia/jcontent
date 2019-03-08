import {Button} from '@jahia/ds-mui-theme';
import React from 'react';

const RetryButton = ({t, classes, doUploadAndStatusUpdate}) => (
    <Button
        key="retry"
        className={classes.actionButton}
        component="a"
        variant="ghost"
        color="inverted"
        onClick={() => doUploadAndStatusUpdate()}
    >
        {t('label.contentManager.fileUpload.retry')}
    </Button>
);

export default RetryButton;
