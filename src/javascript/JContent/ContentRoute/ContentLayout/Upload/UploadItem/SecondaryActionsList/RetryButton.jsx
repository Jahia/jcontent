import React from 'react';
import PropTypes from 'prop-types';
import {Button} from '@jahia/moonstone';

const RetryButton = ({t, classes, doUploadAndStatusUpdate}) => (
    <Button
        key="retry"
        isReversed
        size="big"
        className={classes.actionButton}
        component="a"
        variant="ghost"
        label={t('jcontent:label.contentManager.fileUpload.retry')}
        onClick={() => doUploadAndStatusUpdate()}
    />
);

RetryButton.propTypes = {
    t: PropTypes.func.isRequired,
    classes: PropTypes.object.isRequired,
    doUploadAndStatusUpdate: PropTypes.func.isRequired
};

export default RetryButton;
