import PropTypes from 'prop-types';
import React from 'react';
import {Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField} from '@material-ui/core';
import {Button} from '@jahia/moonstone';
import {useTranslation} from 'react-i18next';
import styles from './CreateFolderDialog.scss';

const CreateFolderDialog = ({isOpen, isLoading, name, isNameValid, isNameAvailable, handleCancel, handleCreate, onChangeName}) => {
    const {t} = useTranslation();
    return (
        <Dialog open={isOpen}
                aria-labelledby="form-dialog-title"
                classes={{paper: styles.root}}
                onClose={handleCancel}
        >
            <DialogTitle id="form-dialog-title">{t('jcontent:label.contentManager.createFolderAction.title')}</DialogTitle>
            <DialogContent>
                <DialogContentText className={!isNameValid || !isNameAvailable ? styles.error : null}>
                    {t('jcontent:label.contentManager.createFolderAction.text')}
                </DialogContentText>
                <TextField
                    fullWidth
                    autoFocus
                    error={!isNameValid || !isNameAvailable}
                    value={name}
                    id="folder-name"
                    aria-describedby="folder-name-error-text"
                    margin="dense"
                    helperText={isNameAvailable ? '' : t('jcontent:label.contentManager.createFolderAction.exists')}
                    onChange={onChangeName}
                />
            </DialogContent>
            <DialogActions>
                <Button
                    size="big"
                    data-cm-role="create-folder-as-cancel"
                    label={t('jcontent:label.contentManager.createFolderAction.cancel')}
                    onClick={handleCancel}
                />
                <Button
                    color="accent"
                    size="big"
                    data-cm-role="create-folder-as-confirm"
                    isDisabled={isLoading || !name || !isNameValid || !isNameAvailable}
                    label={t('jcontent:label.contentManager.createFolderAction.ok')}
                    onClick={handleCreate}
                />
            </DialogActions>
        </Dialog>
    );
};

CreateFolderDialog.propTypes = {
    handleCancel: PropTypes.func.isRequired,
    handleCreate: PropTypes.func.isRequired,
    isOpen: PropTypes.bool.isRequired,
    isLoading: PropTypes.bool.isRequired,
    isNameValid: PropTypes.bool.isRequired,
    isNameAvailable: PropTypes.bool.isRequired,
    name: PropTypes.string.isRequired,
    onChangeName: PropTypes.func.isRequired
};

export default CreateFolderDialog;
