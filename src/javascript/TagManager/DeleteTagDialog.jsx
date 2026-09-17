import React from 'react';
import PropTypes from 'prop-types';
import {Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle} from '@material-ui/core';
import {Button} from '@jahia/moonstone';
import {Trans, useTranslation} from 'react-i18next';
import styles from './TagManager.scss';

export const DeleteTagDialog = ({siteName, tag = null, isOpen = false, isLoading = false, onClose, onConfirm}) => {
    const {t} = useTranslation('jcontent');

    return (
        <Dialog open={isOpen} classes={{paper: styles.dialogRoot}} PaperProps={{'data-cm-role': 'tag-manager-delete-dialog'}} onClose={onClose}>
            <DialogTitle className={styles.dialogTitle}>{t('jcontent:label.contentManager.tagManager.delete.title', {tag: tag?.name})}</DialogTitle>
            <DialogContent>
                <DialogContentText className={styles.dialogText}>
                    <Trans
                        i18nKey="jcontent:label.contentManager.tagManager.delete.description"
                        values={{
                            count: tag?.occurrences || 0,
                            siteName
                        }}
                        components={[
                            <span key="delete-danger-text" className={styles.dangerText}/>
                        ]}
                    />
                </DialogContentText>
            </DialogContent>
            <DialogActions className={styles.dialogActions}>
                <Button
                    size="big"
                    data-cm-role="tag-manager-cancel-delete"
                    label={t('jcontent:label.cancel')}
                    onClick={onClose}
                />
                <Button
                    color="danger"
                    size="big"
                    data-cm-role="tag-manager-confirm-delete"
                    disabled={isLoading}
                    label={t('jcontent:label.contentManager.tagManager.delete.confirm')}
                    onClick={onConfirm}
                />
            </DialogActions>
        </Dialog>
    );
};

DeleteTagDialog.propTypes = {
    siteName: PropTypes.string.isRequired,
    tag: PropTypes.shape({
        name: PropTypes.string,
        occurrences: PropTypes.number
    }),
    isOpen: PropTypes.bool,
    isLoading: PropTypes.bool,
    onClose: PropTypes.func.isRequired,
    onConfirm: PropTypes.func.isRequired
};
