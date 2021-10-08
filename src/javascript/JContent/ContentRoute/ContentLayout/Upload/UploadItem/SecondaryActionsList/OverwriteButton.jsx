import React from 'react';
import PropTypes from 'prop-types';
import {Button} from '@jahia/moonstone';

const OverwriteButton = ({t, classes, doUploadAndStatusUpdate}) => (
    <Button
        key="overwrite"
        isReversed
        size="big"
        className={classes.actionButton}
        component="a"
        variant="ghost"
        label={t('jcontent:label.contentManager.fileUpload.replace')}
        onClick={() => {
            doUploadAndStatusUpdate('replace');
        }}
    />
);

OverwriteButton.propTypes = {
    t: PropTypes.func.isRequired,
    classes: PropTypes.object.isRequired,
    doUploadAndStatusUpdate: PropTypes.func.isRequired
};

export default OverwriteButton;
