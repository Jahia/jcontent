import {Button} from '@jahia/ds-mui-theme';
import React from 'react';

const OverwriteButton = ({t, classes, doUploadAndStatusUpdate}) => (
    <Button
        key="overwrite"
        className={classes.actionButton}
        component="a"
        variant="ghost"
        color="inverted"
        onClick={() => {
            doUploadAndStatusUpdate('replace');
        }}
    >
        {t('label.contentManager.fileUpload.replace')}
    </Button>
);

export default OverwriteButton;
