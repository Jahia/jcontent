import PropTypes from 'prop-types';
import React from 'react';
import {
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Input,
    withStyles
} from '@material-ui/core';
import {Button} from '@jahia/ds-mui-theme';
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
                <Button variant="secondary" onClick={handleClose}>
                    {t('label.contentManager.editImage.saveAsDialog.cancel')}
                </Button>
                <Button variant="primary" onClick={handleSave}>
                    {t('label.contentManager.editImage.saveAsDialog.save')}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

SaveAsDialog.propTypes = {
    t: PropTypes.func.isRequired,
    classes: PropTypes.object.isRequired,
    handleClose: PropTypes.func.isRequired,
    handleSave: PropTypes.func.isRequired,
    open: PropTypes.bool.isRequired,
    name: PropTypes.string.isRequired,
    onChangeName: PropTypes.func.isRequired
};

export default compose(
    translate(),
    withStyles(styles)
)(SaveAsDialog);
