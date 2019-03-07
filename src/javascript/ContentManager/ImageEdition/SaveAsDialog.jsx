import React from 'react';
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Input,
    withStyles
} from '@material-ui/core';
import {compose} from 'react-apollo';
import {translate} from 'react-i18next';

let styles = {
    root: {
        minWidth: '600px'
    }
};

export const SaveAsDialog = ({open, handleClose, handleSave, classes, t, name, onChangeName}) => {
    let textField = React.createRef();

    return (
        <Dialog open={open}
                aria-labelledby="form-dialog-title"
                classes={{paper: classes.root}}
                onClose={handleClose}
        >
            <DialogTitle id="form-dialog-title">{t('label.contentManager.editImage.saveAsDialog.title')}</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    {t('label.contentManager.editImage.saveAsDialog.text')}
                </DialogContentText>
                <Input
                    autoFocus
                    fullWidth
                    inputRef={textField}
                    value={name}
                    id="fileName"
                    margin="dense"
                    onChange={onChangeName}
                />
            </DialogContent>
            <DialogActions>
                <Button color="default" onClick={handleClose}>
                    {t('label.contentManager.editImage.saveAsDialog.cancel')}
                </Button>
                <Button color="primary" onClick={handleSave}>
                    {t('label.contentManager.editImage.saveAsDialog.save')}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default compose(
    translate(),
    withStyles(styles)
)(SaveAsDialog);
