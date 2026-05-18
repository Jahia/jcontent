import React, {useState} from 'react';
import PropTypes from 'prop-types';
import {Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle} from '@material-ui/core';
import {Button, Close, Input, Search} from '@jahia/moonstone';
import {useTranslation} from 'react-i18next';
import {useTagSuggestions} from './useTagSuggestions';
import {TagSuggestions} from './TagSuggestions';
import styles from './TagManager.scss';

export const EditNodeTagDialog = ({siteKey, tag = null, node = null, isOpen = false, isLoading = false, onClose, onConfirm}) => {
    const {t} = useTranslation('jcontent');
    const [value, setValue] = useState(tag || '');

    const normalizedValue = value.trim();
    const suggestions = useTagSuggestions({siteKey, isOpen, value});

    return (
        <Dialog open={isOpen} classes={{paper: styles.dialogRoot}} PaperProps={{'data-cm-role': 'tag-manager-edit-node-dialog'}} onClose={onClose}>
            <DialogTitle className={styles.dialogTitle}>{t('jcontent:label.contentManager.tagManager.editNodeTag.title', {tag, contentName: node?.displayName || node?.path})}</DialogTitle>
            <DialogContent>
                <DialogContentText className={styles.dialogText}>
                    {t('jcontent:label.contentManager.tagManager.editNodeTag.description')}
                </DialogContentText>
                <Input
                    autoFocus
                    size="big"
                    className={styles.renameInput}
                    data-cm-role="tag-manager-edit-node-input"
                    value={value}
                    placeholder={t('jcontent:label.contentManager.tagManager.editNodeTag.placeholder')}
                    variant={{interactive: <Search/>}}
                    postfixComponents={value ? (
                        <Button
                            icon={<Close/>}
                            variant="ghost"
                            onClick={() => setValue('')}
                        />
                    ) : null}
                    onChange={event => setValue(event.target.value)}
                />
                <TagSuggestions
                    label={t('jcontent:label.contentManager.tagManager.editNodeTag.suggestions')}
                    suggestions={suggestions}
                    onSelect={setValue}
                />
            </DialogContent>
            <DialogActions className={styles.dialogActions}>
                <Button
                    size="big"
                    data-cm-role="tag-manager-cancel-edit-node"
                    label={t('jcontent:label.cancel')}
                    onClick={onClose}
                />
                <Button
                    color="accent"
                    size="big"
                    data-cm-role="tag-manager-confirm-edit-node"
                    disabled={isLoading || normalizedValue.length === 0 || normalizedValue === tag}
                    label={t('jcontent:label.contentManager.tagManager.editNodeTag.confirm')}
                    onClick={() => onConfirm(normalizedValue)}
                />
            </DialogActions>
        </Dialog>
    );
};

EditNodeTagDialog.propTypes = {
    siteKey: PropTypes.string.isRequired,
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
