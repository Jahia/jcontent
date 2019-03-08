import {Button} from '@jahia/ds-mui-theme';
import React from 'react';

const RenameButton = ({t, classes, showRenameDialog}) => (
    <Button
        key="rename"
        className={classes.actionButton}
        component="a"
        variant="ghost"
        color="inverted"
        onClick={showRenameDialog}
    >
        {t('label.contentManager.fileUpload.rename')}
    </Button>
);

export default RenameButton;
