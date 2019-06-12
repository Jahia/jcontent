import React from 'react';
import PropTypes from 'prop-types';
import {Button} from '@jahia/design-system-kit';

const DontUploadButton = ({removeFile, index, removeUploadFromQueue, t, classes, updateUploadsStatus, type}) => (
    <Button
        key="dontupload"
        className={classes.actionButton}
        component="a"
        variant="ghost"
        color="inverted"
        onClick={() => {
            removeFile(index);
            removeUploadFromQueue(index);
            updateUploadsStatus();
        }}
    >
        {type === 'import' ? t('label.contentManager.fileUpload.dontImport') : t('label.contentManager.fileUpload.dontUpload')}
    </Button>
);

DontUploadButton.propTypes = {
    t: PropTypes.func.isRequired,
    classes: PropTypes.object.isRequired,
    updateUploadsStatus: PropTypes.func.isRequired,
    removeFile: PropTypes.func.isRequired,
    index: PropTypes.number.isRequired,
    removeUploadFromQueue: PropTypes.func.isRequired,
    type: PropTypes.string
};

export default DontUploadButton;
