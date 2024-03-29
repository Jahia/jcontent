import React from 'react';
import {Dialog, DialogActions, DialogContent, DialogTitle} from '@material-ui/core';
import {Button, Typography} from '@jahia/moonstone';
import * as PropTypes from 'prop-types';
import {useTranslation} from 'react-i18next';
import {SaveButton} from './SaveButton';
import styles from './CloseConfirmationDialog.scss';
import {useContentEditorContext} from '~/ContentEditor/contexts/ContentEditor';

export const CloseConfirmationDialog = React.memo(({isOpen, onCloseDialog, actionCallback}) => {
    const {t} = useTranslation('jcontent');
    const {mode} = useContentEditorContext();
    const titleKey = `jcontent:label.contentEditor.edit.action.goBack.${mode}.title`;
    const messageKey = `jcontent:label.contentEditor.edit.action.goBack.${mode}.message`;
    const handleDiscard = () => {
        onCloseDialog();
        actionCallback({discard: true});
    };

    return (
        <Dialog
            maxWidth="md"
            aria-labelledby="alert-dialog-slide-title"
            open={isOpen}
            onClose={onCloseDialog}
        >
            <DialogTitle id="alert-dialog-slide-title">
                {t(titleKey)}
            </DialogTitle>
            <DialogContent className={styles.dialogContent}>
                <Typography>
                    {t(messageKey)}
                </Typography>
            </DialogContent>
            <DialogActions>
                <Button
                    size="big"
                    variant="ghost"
                    label={t('jcontent:label.contentEditor.edit.action.goBack.btnContinue')}
                    data-sel-role="close-dialog-cancel"
                    onClick={onCloseDialog}
                />
                <Button
                    size="big"
                    label={t('jcontent:label.contentEditor.edit.action.goBack.btnDiscard')}
                    data-sel-role="close-dialog-discard"
                    onClick={handleDiscard}
                />
                <SaveButton data-sel-role="close-dialog-save"
                            actionCallback={actionCallback}
                            onCloseDialog={onCloseDialog}/>
            </DialogActions>
        </Dialog>
    );
});

CloseConfirmationDialog.displayName = 'CloseConfirmationDialog';

CloseConfirmationDialog.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    actionCallback: PropTypes.func.isRequired,
    onCloseDialog: PropTypes.func.isRequired
};
