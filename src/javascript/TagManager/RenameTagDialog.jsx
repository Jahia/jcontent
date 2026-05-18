import React, {useState} from 'react';
import PropTypes from 'prop-types';
import {Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle} from '@material-ui/core';
import {Button, Close, Input, Search} from '@jahia/moonstone';
import {Trans, useTranslation} from 'react-i18next';
import {useTagSuggestions} from './useTagSuggestions';
import {TagSuggestions} from './TagSuggestions';
import styles from './TagManager.scss';

export const RenameTagDialog = ({siteKey, siteName, tag = null, isOpen = false, isLoading = false, onClose, onConfirm}) => {
    const {t} = useTranslation('jcontent');
    const [value, setValue] = useState(tag?.name || '');

    const normalizedValue = value.trim();
    const suggestions = useTagSuggestions({siteKey, isOpen, value});

    return (
        <Dialog open={isOpen} classes={{paper: styles.dialogRoot}} PaperProps={{'data-cm-role': 'tag-manager-rename-dialog'}} onClose={onClose}>
            <DialogTitle className={styles.dialogTitle}>{t('jcontent:label.contentManager.tagManager.rename.title', {tag: tag?.name})}</DialogTitle>
            <DialogContent>
                <DialogContentText className={styles.dialogText}>
                    <Trans
                        i18nKey="jcontent:label.contentManager.tagManager.rename.description"
                        values={{
                            count: tag?.occurrences || 0,
                            siteName
                        }}
                        components={[
                            <strong key="rename-live-site"/>,
                            <span key="rename-danger-text" className={styles.dangerText}/>
                        ]}
                    />
                </DialogContentText>
                <Input
                    autoFocus
                    size="big"
                    className={styles.renameInput}
                    data-cm-role="tag-manager-rename-input"
                    value={value}
                    placeholder={t('jcontent:label.contentManager.tagManager.rename.placeholder')}
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
                    label={t('jcontent:label.contentManager.tagManager.rename.suggestions')}
                    suggestions={suggestions}
                    onSelect={setValue}
                />
            </DialogContent>
            <DialogActions className={styles.dialogActions}>
                <Button
                    size="big"
                    data-cm-role="tag-manager-cancel-rename"
                    label={t('jcontent:label.cancel')}
                    onClick={onClose}
                />
                <Button
                    color="accent"
                    size="big"
                    data-cm-role="tag-manager-confirm-rename"
                    disabled={isLoading || normalizedValue.length === 0 || normalizedValue === tag?.name}
                    label={t('jcontent:label.contentManager.tagManager.rename.confirm')}
                    onClick={() => onConfirm(normalizedValue)}
                />
            </DialogActions>
        </Dialog>
    );
};

RenameTagDialog.propTypes = {
    siteKey: PropTypes.string.isRequired,
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
