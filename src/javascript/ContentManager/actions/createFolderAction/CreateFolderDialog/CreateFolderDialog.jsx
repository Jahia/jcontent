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
import {Button} from '@jahia/design-system-kit';
import {compose} from 'react-apollo';
import {translate} from 'react-i18next';

let styles = theme => ({
    root: {
        minWidth: '600px'
    },
    error: {
        color: theme.palette.error.main
    }
});

const CreateFolderDialog = ({classes, t, open, loading, name, isNameValid, isNameAvailable, handleCancel, handleCreate, onChangeName}) => {
    let textField = React.createRef();

    return (
        <Dialog open={open}
                aria-labelledby="form-dialog-title"
                classes={{paper: classes.root}}
                onClose={handleCancel}
        >
            <DialogTitle id="form-dialog-title">{t('label.contentManager.createFolderAction.title')}</DialogTitle>
            <DialogContent>
                <DialogContentText className={!isNameValid || !isNameAvailable ? classes.error : null}>
                    {t('label.contentManager.createFolderAction.text')}
                </DialogContentText>
                <TextField
                    fullWidth
                    autoFocus
                    error={!isNameValid || !isNameAvailable}
                    inputRef={textField}
                    value={name}
                    id="folder-name"
                    aria-describedby="folder-name-error-text"
                    margin="dense"
                    helperText={!isNameAvailable ? t('label.contentManager.createFolderAction.exists') : ''}
                    onChange={onChangeName}
                />
            </DialogContent>
            <DialogActions>
                <Button variant="secondary" data-cm-role="create-folder-as-cancel" onClick={handleCancel}>
                    {t('label.contentManager.createFolderAction.cancel')}
                </Button>
                <Button variant="primary"
                        data-cm-role="create-folder-as-confirm"
                        disabled={loading || !name || !isNameValid || !isNameAvailable}
                        onClick={handleCreate}
                >
                    {t('label.contentManager.createFolderAction.ok')}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

CreateFolderDialog.propTypes = {
    t: PropTypes.func.isRequired,
    classes: PropTypes.object.isRequired,
    handleCancel: PropTypes.func.isRequired,
    handleCreate: PropTypes.func.isRequired,
    open: PropTypes.bool.isRequired,
    loading: PropTypes.bool.isRequired,
    isNameValid: PropTypes.bool.isRequired,
    isNameAvailable: PropTypes.bool.isRequired,
    name: PropTypes.string.isRequired,
    onChangeName: PropTypes.func.isRequired
};

export default compose(
    translate(),
    withStyles(styles)
)(CreateFolderDialog);
