import React from 'react';
import {Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle} from '@material-ui/core';
import {Button} from '@jahia/design-system-kit';
import {translate} from 'react-i18next';
import {compose} from 'react-apollo';
import PropTypes from 'prop-types';

export class UnsavedChangesDialog extends React.Component {
    render() {
        let {t, open, onBack, onClose} = this.props;
        return (
            <Dialog fullWidth open={open} aria-labelledby="form-dialog-title" onClose={onClose}>
                <DialogTitle>
                    {t('label.contentManager.editImage.discardChangesTitle')}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        {t('label.contentManager.editImage.exitConfirmation')}
                    </DialogContentText>
                    <DialogActions>
                        <Button variant="secondary" onClick={onClose}>
                            {t('label.contentManager.editImage.continueEditing')}
                        </Button>
                        <Button variant="primary" onClick={onBack}>
                            {t('label.contentManager.editImage.discardChangesButton')}
                        </Button>
                    </DialogActions>
                </DialogContent>
            </Dialog>
        );
    }
}

UnsavedChangesDialog.propTypes = {
    t: PropTypes.func.isRequired,
    open: PropTypes.bool.isRequired,
    onBack: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired
};

export default compose(
    translate()
)(UnsavedChangesDialog);
