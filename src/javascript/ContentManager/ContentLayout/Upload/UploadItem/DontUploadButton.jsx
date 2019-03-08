import {Button} from '@jahia/ds-mui-theme';
import {removeUpload} from '../Upload.redux-actions';
import React from 'react';

const DontUploadButton = ({removeFile, index, dispatch, t, classes, updateUploadsStatus, type}) => (
    <Button
        key="dontupload"
        className={classes.actionButton}
        component="a"
        variant="ghost"
        color="inverted"
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
