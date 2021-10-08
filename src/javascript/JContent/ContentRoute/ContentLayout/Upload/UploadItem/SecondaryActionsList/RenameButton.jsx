import React from 'react';
import PropTypes from 'prop-types';
import {Button} from '@jahia/moonstone';

const RenameButton = ({t, classes, showRenameDialog}) => (
    <Button
        key="rename"
        isReversed
        size="big"
        className={classes.actionButton}
        component="a"
        variant="ghost"
        label={t('jcontent:label.contentManager.fileUpload.rename')}
        onClick={showRenameDialog}
    />
);

RenameButton.propTypes = {
    t: PropTypes.func.isRequired,
    classes: PropTypes.object.isRequired,
    showRenameDialog: PropTypes.func.isRequired
};

export default RenameButton;
