import React from 'react';
import PropTypes from 'prop-types';
import {Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle} from '@material-ui/core';
import {Button} from '@jahia/moonstone';
import {Trans, useTranslation} from 'react-i18next';
import styles from './TagManager.scss';

export const DeleteNodeTagDialog = ({tag = null, node = null, isOpen = false, isLoading = false, onClose, onConfirm}) => {
    const {t} = useTranslation('jcontent');

    return (
        <Dialog open={isOpen} classes={{paper: styles.dialogRoot}} PaperProps={{'data-cm-role': 'tag-manager-delete-node-dialog'}} onClose={onClose}>
            <DialogTitle className={styles.dialogTitle}>{t('jcontent:label.contentManager.tagManager.deleteNodeTag.title', {tag})}</DialogTitle>
            <DialogContent>
                <DialogContentText className={styles.dialogText}>
                    <Trans
                        i18nKey="jcontent:label.contentManager.tagManager.deleteNodeTag.description"
                        values={{
                            tag,
                            contentName: node?.displayName || node?.path
                        }}
                        components={[
                            <span key="delete-node-danger-text" className={styles.dangerText}/>
                        ]}
                    />
                </DialogContentText>
            </DialogContent>
            <DialogActions className={styles.dialogActions}>
                <Button
                    size="big"
                    data-cm-role="tag-manager-cancel-delete-node"
                    label={t('jcontent:label.cancel')}
                    onClick={onClose}
                />
                <Button
                    color="danger"
                    size="big"
                    data-cm-role="tag-manager-confirm-delete-node"
                    disabled={isLoading}
                    label={t('jcontent:label.contentManager.tagManager.deleteNodeTag.confirm')}
                    onClick={onConfirm}
                />
            </DialogActions>
        </Dialog>
    );
};

DeleteNodeTagDialog.propTypes = {
    tag: PropTypes.string,
    node: PropTypes.shape({
        displayName: PropTypes.string,
        path: PropTypes.string
    }),
    isOpen: PropTypes.bool,
    isLoading: PropTypes.bool,
    onClose: PropTypes.func.isRequired,
    onConfirm: PropTypes.func.isRequired
};
