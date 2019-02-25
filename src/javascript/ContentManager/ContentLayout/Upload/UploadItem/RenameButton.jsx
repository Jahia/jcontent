import {Button} from '@material-ui/core';
import React from 'react';

const RenameButton = ({t, classes, showRenameDialog}) => (
    <Button
        key="rename"
        className={classes.actionButton}
        component="a"
        size="small"
        onClick={showRenameDialog}
    >
        {t('label.contentManager.fileUpload.rename')}
    </Button>
);

export default RenameButton;
