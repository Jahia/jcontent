import PropTypes from 'prop-types';
import React from 'react';
import {
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    withStyles
} from '@material-ui/core';
import {Button} from '@jahia/design-system-kit';
import {compose} from 'react-apollo';
import {translate} from 'react-i18next';

let styles = {
    root: {
        minWidth: '600px'
    }
};

export const ConfirmSaveDialog = ({open, handleClose, handleSave, classes, t}) => (
    <Dialog open={open}
            aria-labelledby="form-dialog-title"
            classes={{paper: classes.root}}
            onClose={handleClose}
    >
        <DialogTitle id="form-dialog-title">{t('label.contentManager.editImage.confirmSaveDialog.title')}</DialogTitle>
        <DialogContent>
            <DialogContentText>
                {t('label.contentManager.editImage.confirmSaveDialog.text')}
            </DialogContentText>
        </DialogContent>
        <DialogActions>
            <Button variant="secondary" data-cm-role="image-save-no" onClick={handleClose}>
                {t('label.contentManager.editImage.confirmSaveDialog.no')}
            </Button>
            <Button variant="primary" data-cm-role="image-save-yes" onClick={() => handleSave()}>
                {t('label.contentManager.editImage.confirmSaveDialog.yes')}
            </Button>
        </DialogActions>
    </Dialog>
);

ConfirmSaveDialog.propTypes = {
    t: PropTypes.func.isRequired,
    classes: PropTypes.object.isRequired,
    handleClose: PropTypes.func.isRequired,
    handleSave: PropTypes.func.isRequired,
    open: PropTypes.bool.isRequired
};

export default compose(
    translate(),
    withStyles(styles)
)(ConfirmSaveDialog);
