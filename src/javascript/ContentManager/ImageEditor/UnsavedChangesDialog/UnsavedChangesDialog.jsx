import React from 'react';
import {Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle} from '@material-ui/core';
import {Button} from '@jahia/design-system-kit';
import {withTranslation} from 'react-i18next';
import {compose} from 'react-apollo';
import PropTypes from 'prop-types';

export class UnsavedChangesDialog extends React.Component {
    render() {
        let {t, open, onBack, onClose} = this.props;
        return (
            <Dialog fullWidth open={open} aria-labelledby="form-dialog-title" onClose={onClose}>
                <DialogTitle>
                    {t('content-media-manager:label.contentManager.editImage.discardChangesTitle')}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        {t('content-media-manager:label.contentManager.editImage.exitConfirmation')}
                    </DialogContentText>
                    <DialogActions>
                        <Button variant="secondary" onClick={onClose}>
                            {t('content-media-manager:label.contentManager.editImage.continueEditing')}
                        </Button>
                        <Button variant="primary" onClick={onBack}>
                            {t('content-media-manager:label.contentManager.editImage.discardChangesButton')}
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
    withTranslation()
)(UnsavedChangesDialog);
