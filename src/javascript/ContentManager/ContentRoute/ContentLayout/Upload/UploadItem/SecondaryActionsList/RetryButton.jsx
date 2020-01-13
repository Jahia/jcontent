import React from 'react';
import PropTypes from 'prop-types';
import {Button} from '@jahia/design-system-kit';

const RetryButton = ({t, classes, doUploadAndStatusUpdate}) => (
    <Button
        key="retry"
        className={classes.actionButton}
        component="a"
        variant="ghost"
        color="inverted"
        onClick={() => doUploadAndStatusUpdate()}
    >
        {t('content-media-manager:label.contentManager.fileUpload.retry')}
    </Button>
);

RetryButton.propTypes = {
    t: PropTypes.func.isRequired,
    classes: PropTypes.object.isRequired,
    doUploadAndStatusUpdate: PropTypes.func.isRequired
};

export default RetryButton;
