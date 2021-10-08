import PropTypes from 'prop-types';
import React from 'react';
import {
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    TextField,
    withStyles
} from '@material-ui/core';
import {compose} from '~/utils';
import {withTranslation} from 'react-i18next';
import {Button} from '@jahia/moonstone';

let styles = {
    root: {
        minWidth: '600px'
    }
};

export const SaveAsDialog = ({isOpen, handleClose, handleSave, classes, t, name, onChangeName, isNameValid}) => {
    return (
        <Dialog open={isOpen}
                aria-labelledby="form-dialog-title"
                classes={{paper: classes.root}}
                onClose={handleClose}
        >
            <DialogTitle id="form-dialog-title">{t('jcontent:label.contentManager.editImage.saveAsDialog.title')}</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    {t('jcontent:label.contentManager.editImage.saveAsDialog.text')}
                </DialogContentText>
                <TextField
                    autoFocus
                    fullWidth
                    error={!isNameValid}
                    value={name}
                    id="fileName"
                    margin="dense"
                    onChange={onChangeName}
                />
            </DialogContent>
            <DialogActions>
                <Button label={t('jcontent:label.contentManager.editImage.saveAsDialog.cancel')} size="big" data-cm-role="image-save-as-cancel" onClick={handleClose}/>
                <Button label={t('jcontent:label.contentManager.editImage.saveAsDialog.save')} size="big" color="accent" data-cm-role="image-save-as-confirm" disabled={!isNameValid} onClick={handleSave}/>
            </DialogActions>
        </Dialog>
    );
};

SaveAsDialog.propTypes = {
    t: PropTypes.func.isRequired,
    classes: PropTypes.object.isRequired,
    handleClose: PropTypes.func.isRequired,
    handleSave: PropTypes.func.isRequired,
    isOpen: PropTypes.bool.isRequired,
    name: PropTypes.string.isRequired,
    onChangeName: PropTypes.func.isRequired,
    isNameValid: PropTypes.bool.isRequired
};

export default compose(
    withTranslation(),
    withStyles(styles)
)(SaveAsDialog);
