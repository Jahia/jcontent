import React from 'react';
import PropTypes from 'prop-types';
import {Button} from '@jahia/moonstone';

const DontUploadButton = ({removeFile, index, removeUploadFromQueue, t, classes, updateUploadsStatus, type}) => (
    <Button
        key="dontupload"
        isReversed
        size="big"
        className={classes.actionButton}
        component="a"
        variant="ghost"
        label={type === 'import' ? t('jcontent:label.contentManager.fileUpload.dontImport') : t('jcontent:label.contentManager.fileUpload.dontUpload')}
        onClick={() => {
            removeFile(index);
            removeUploadFromQueue(index);
            updateUploadsStatus();
        }}
    />
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
