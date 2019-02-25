import {Button} from '@material-ui/core';
import React from 'react';

const OverwriteButton = ({t, classes, doUploadAndStatusUpdate}) => (
    <Button
        key="overwrite"
        className={classes.actionButton}
        component="a"
        size="small"
        onClick={() => {
            doUploadAndStatusUpdate('replace');
        }}
    >
        {t('label.contentManager.fileUpload.replace')}
    </Button>
);

export default OverwriteButton;
