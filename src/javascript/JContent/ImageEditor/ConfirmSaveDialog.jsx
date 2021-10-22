import PropTypes from 'prop-types';
import React from 'react';
import {Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle} from '@material-ui/core';
import {Button} from '@jahia/moonstone';
import {useTranslation} from 'react-i18next';
import styles from './ConfirmSaveDialog.scss';

export const ConfirmSaveDialog = ({isOpen, handleClose, handleSave}) => {
    const {t} = useTranslation();
    return (
        <Dialog open={isOpen}
                aria-labelledby="form-dialog-title"
                classes={{paper: styles.root}}
                onClose={handleClose}
        >
            <DialogTitle
                id="form-dialog-title"
            >{t('jcontent:label.contentManager.editImage.confirmSaveDialog.title')}
            </DialogTitle>
            <DialogContent>
                <DialogContentText>
                    {t('jcontent:label.contentManager.editImage.confirmSaveDialog.text')}
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button variant="default"
                        color="default"
                        size="big"
                        data-cm-role="image-save-no"
                        label={t('jcontent:label.contentManager.editImage.confirmSaveDialog.no')}
                        onClick={handleClose}/>
                <Button variant="default"
                        color="accent"
                        size="big"
                        data-cm-role="image-save-yes"
                        label={t('jcontent:label.contentManager.editImage.confirmSaveDialog.yes')}
                        onClick={handleSave}/>
            </DialogActions>
        </Dialog>
    );
};

ConfirmSaveDialog.propTypes = {
    handleClose: PropTypes.func.isRequired,
    handleSave: PropTypes.func.isRequired,
    isOpen: PropTypes.bool.isRequired
};

export default ConfirmSaveDialog;
