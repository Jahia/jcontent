import React from 'react';
import {Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle} from '@material-ui/core';
import {withTranslation} from 'react-i18next';
import {compose} from '~/utils';
import PropTypes from 'prop-types';
import {Button} from '@jahia/moonstone';

export class UnsavedChangesDialog extends React.Component {
    render() {
        let {t, isOpen, onBack, onClose} = this.props;
        return (
            <Dialog fullWidth open={isOpen} aria-labelledby="form-dialog-title" onClose={onClose}>
                <DialogTitle>
                    {t('jcontent:label.contentManager.editImage.discardChangesTitle')}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        {t('jcontent:label.contentManager.editImage.exitConfirmation')}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button label={t('jcontent:label.contentManager.editImage.continueEditing')} size="big" onClick={onClose}/>
                    <Button label={t('jcontent:label.contentManager.editImage.discardChangesButton')} size="big" color="accent" onClick={onBack}/>
                </DialogActions>
            </Dialog>
        );
    }
}

UnsavedChangesDialog.propTypes = {
    t: PropTypes.func.isRequired,
    isOpen: PropTypes.bool.isRequired,
    onBack: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired
};

export default compose(
    withTranslation()
)(UnsavedChangesDialog);
