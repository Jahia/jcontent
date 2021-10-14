import PropTypes from 'prop-types';
import React from 'react';
import {Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, withStyles} from '@material-ui/core';
import {Button} from '@jahia/moonstone';
import {compose} from '~/utils';
import {withTranslation} from 'react-i18next';

let styles = {
    root: {
        minWidth: '600px'
    }
};

export const ConfirmSaveDialog = ({isOpen, handleClose, handleSave, classes, t}) => (
    <Dialog open={isOpen}
            aria-labelledby="form-dialog-title"
            classes={{paper: classes.root}}
            onClose={handleClose}
    >
        <DialogTitle id="form-dialog-title">{t('jcontent:label.contentManager.editImage.confirmSaveDialog.title')}</DialogTitle>
        <DialogContent>
            <DialogContentText>
                {t('jcontent:label.contentManager.editImage.confirmSaveDialog.text')}
            </DialogContentText>
        </DialogContent>
        <DialogActions>
            <Button variant="default" color="default" size="big" data-cm-role="image-save-no" label={t('jcontent:label.contentManager.editImage.confirmSaveDialog.no')} onClick={handleClose}/>
            <Button variant="default" color="accent" size="big" data-cm-role="image-save-yes" label={t('jcontent:label.contentManager.editImage.confirmSaveDialog.yes')} onClick={handleSave}/>
        </DialogActions>
    </Dialog>
);

ConfirmSaveDialog.propTypes = {
    t: PropTypes.func.isRequired,
    classes: PropTypes.object.isRequired,
    handleClose: PropTypes.func.isRequired,
    handleSave: PropTypes.func.isRequired,
    isOpen: PropTypes.bool.isRequired
};

export default compose(
    withTranslation(),
    withStyles(styles)
)(ConfirmSaveDialog);
