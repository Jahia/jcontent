import {Button} from '@material-ui/core';
import {removeUpload} from '../Upload.redux-actions';
import React from 'react';

const DontUploadButton = ({removeFile, index, dispatch, t, classes, updateUploadsStatus, type}) => (
    <Button
        key="dontupload"
        className={classes.actionButton}
        component="a"
        size="small"
        onClick={() => {
            removeFile(index);
            dispatch(removeUpload(index));
            updateUploadsStatus();
        }}
    >
        {type === 'import' ? t('label.contentManager.fileUpload.dontImport') : t('label.contentManager.fileUpload.dontUpload')}
    </Button>
);

export default DontUploadButton;
