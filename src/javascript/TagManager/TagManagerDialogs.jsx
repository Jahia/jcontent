import React, {useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import {Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle} from '@material-ui/core';
import {Button, Close, Input, Search, Typography} from '@jahia/moonstone';
import {Trans, useTranslation} from 'react-i18next';
import {useTagSuggestions} from './useTagSuggestions';
import styles from './TagManager.scss';

const TagSuggestions = ({label, suggestions, onSelect}) => {
    if (suggestions.length === 0) {
        return null;
    }

    return (
        <div className={styles.suggestionsBlock}>
            <Typography variant="caption" weight="bold">
                {label}
            </Typography>
            <div className={styles.suggestionsList}>
                {suggestions.map(suggestion => (
                    <Button
                        key={suggestion.name}
                        variant="ghost"
                        size="small"
                        label={suggestion.name}
                        onClick={() => onSelect(suggestion.name)}
                    />
                ))}
            </div>
        </div>
    );
};

TagSuggestions.propTypes = {
    label: PropTypes.string.isRequired,
    suggestions: PropTypes.arrayOf(PropTypes.shape({
        name: PropTypes.string.isRequired
    })).isRequired,
    onSelect: PropTypes.func.isRequired
};

export const RenameTagDialog = ({siteKey, siteName, tag, isOpen, isLoading, onClose, onConfirm}) => {
    const {t} = useTranslation('jcontent');
    const [value, setValue] = useState(tag?.name || '');

    useEffect(() => {
        setValue(tag?.name || '');
    }, [tag]);

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

RenameTagDialog.defaultProps = {
    tag: null,
    isOpen: false,
    isLoading: false
};

export const DeleteTagDialog = ({siteName, tag, isOpen, isLoading, onClose, onConfirm}) => {
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

DeleteTagDialog.defaultProps = {
    tag: null,
    isOpen: false,
    isLoading: false
};

export const DeleteNodeTagDialog = ({tag, node, isOpen, isLoading, onClose, onConfirm}) => {
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

DeleteNodeTagDialog.defaultProps = {
    tag: null,
    node: null,
    isOpen: false,
    isLoading: false
};

export const EditNodeTagDialog = ({siteKey, tag, node, isOpen, isLoading, onClose, onConfirm}) => {
    const {t} = useTranslation('jcontent');
    const [value, setValue] = useState(tag || '');

    useEffect(() => {
        setValue(tag || '');
    }, [tag]);

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

EditNodeTagDialog.defaultProps = {
    tag: null,
    node: null,
    isOpen: false,
    isLoading: false
};
