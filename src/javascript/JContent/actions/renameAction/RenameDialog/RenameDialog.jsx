import React, {useEffect, useState} from 'react';
import {RenameQuery} from './RenameDialog.gql-queries';
import {RenameMutation} from './RenameDialog.gql-mutations';
import PropTypes from 'prop-types';
import {triggerRefetchAll} from '~/JContent/JContent.refetches';
import {useApolloClient, useMutation, useQuery} from '@apollo/react-hooks';
import {Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField} from '@material-ui/core';
import styles from './RenameDialog.scss';
import {Button} from '@jahia/moonstone';
import {useTranslation} from 'react-i18next';

export const RenameDialog = ({path, contentType, onExit}) => {
    const [open, setOpen] = useState(true);
    const [name, updateName] = useState('');

    const {t} = useTranslation('jcontent');

    const invalidRegex = /[\\/:*?"<>|%]/g;

    const client = useApolloClient();
    const {loading, data} = useQuery(RenameQuery, {
        variables: {
            path: path
        },
        fetchPolicy: 'network-only'
    });

    const previousName = data?.jcr?.nodeByPath?.name;
    useEffect(() => {
        if (previousName) {
            updateName(previousName);
        }
    }, [previousName]);

    const [mutation] = useMutation(RenameMutation, {
        onCompleted: () => {
            client.cache.flushNodeEntryByPath(path);
            triggerRefetchAll();
        }
    });

    const onChangeName = e => {
        updateName(e.target.value);
    };

    const handleCancel = () => {
        // Close dialog
        setOpen(false);
    };

    const handleRename = () => {
        // Do mutation to create folder.
        mutation({
            variables: {
                newName: name,
                parentPath: path,
                primaryNodeType: contentType
            }
        }).then(({data}) => {
            return Promise.all(window.contentModificationEventHandlers.map(handler => handler(data.jcr.mutateNode.node.uuid, path, name, 'update')));
        }).then(() => {
            setOpen(false);
        }).catch(e => {
            console.error('Error when renaming', e.message);
            setOpen(false);
        });
    };

    const isNameAvailable = (data?.jcr?.nodeByPath?.parent?.children?.nodes || []).find(node => node.name === name) === undefined;
    const isNameValid = name.match(invalidRegex) === null;

    let errMsg = '';

    if (!isNameAvailable && previousName !== name) {
        errMsg = t('jcontent:label.contentManager.renameAction.exists');
    }

    if (!isNameValid) {
        errMsg = t('jcontent:label.contentManager.renameAction.invalidChars');
    }

    return (
        <Dialog open={open}
                aria-labelledby="form-dialog-title"
                classes={{paper: styles.root}}
                onClose={handleCancel}
                onExited={onExit}
        >
            <DialogTitle id="form-dialog-title">{t('jcontent:label.contentManager.renameAction.title')}</DialogTitle>
            <DialogContent>
                <DialogContentText className={errMsg ? styles.error : null}>
                    {t('jcontent:label.contentManager.renameAction.text')}
                </DialogContentText>
                <TextField
                    fullWidth
                    autoFocus
                    inputProps={{maxLength: 32}}
                    error={Boolean(errMsg)}
                    value={name}
                    id="folder-name"
                    aria-describedby="folder-name-error-text"
                    margin="dense"
                    disabled={loading}
                    helperText={errMsg}
                    onChange={onChangeName}
                />
            </DialogContent>
            <DialogActions>
                <Button
                    size="big"
                    data-cm-role="create-folder-as-cancel"
                    label={t('jcontent:label.cancel')}
                    onClick={handleCancel}
                />
                <Button
                    color="accent"
                    size="big"
                    data-cm-role="create-folder-as-confirm"
                    isDisabled={loading || !name || !isNameValid || !isNameAvailable}
                    label={t('jcontent:label.ok')}
                    onClick={handleRename}
                />
            </DialogActions>
        </Dialog>
    );
};

RenameDialog.propTypes = {
    path: PropTypes.string.isRequired,
    contentType: PropTypes.string.isRequired,
    onExit: PropTypes.func.isRequired
};

