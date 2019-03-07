import React from 'react';
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    withStyles
} from '@material-ui/core';
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
            <Button color="default" onClick={handleClose}>
                {t('label.contentManager.editImage.confirmSaveDialog.no')}
            </Button>
            <Button color="primary" onClick={() => handleSave()}>
                {t('label.contentManager.editImage.confirmSaveDialog.yes')}
            </Button>
        </DialogActions>
    </Dialog>
);

export default compose(
    translate(),
    withStyles(styles)
)(ConfirmSaveDialog);
