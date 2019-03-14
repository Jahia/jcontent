import React from 'react';
import PropTypes from 'prop-types';
import {Button} from '@jahia/ds-mui-theme';

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

RenameButton.propTypes = {
    t: PropTypes.func.isRequired,
    classes: PropTypes.object.isRequired,
    showRenameDialog: PropTypes.func.isRequired
};

export default RenameButton;
