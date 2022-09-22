import React, {useState} from 'react';
import {CreateFolderQuery} from './CreateFolderDialog.gql-queries';
import {CreateFolderMutation} from './CreateFolderDialog.gql-mutations';
import PropTypes from 'prop-types';
import {triggerRefetchAll} from '~/JContent/JContent.refetches';
import {useApolloClient, useMutation, useQuery} from '@apollo/react-hooks';
import {Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField} from '@material-ui/core';
import styles from './CreateFolderDialog.scss';
import {Button} from '@jahia/moonstone';
import {useTranslation} from 'react-i18next';

export const CreateFolderDialog = ({path, contentType, onExit}) => {
    const [open, setOpen] = useState(true);
    const [name, updateName] = useState('');

    const {t} = useTranslation('jcontent');

    const invalidRegex = /[\\/:*?"<>|%]/g;

    const client = useApolloClient();
    const {loading, data} = useQuery(CreateFolderQuery, {
        variables: {
            path: path
        },
        fetchPolicy: 'network-only'
    });
    const [mutation] = useMutation(CreateFolderMutation, {
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

    const handleCreate = () => {
        // Do mutation to create folder.
        mutation({
            variables: {
                folderName: name,
                parentPath: path,
                primaryNodeType: contentType
            }
        });
        setOpen(false);
    };

    const isNameAvailable = (data?.jcr?.nodeByPath?.children?.nodes || []).find(node => node.name === name) === undefined;
    const isNameValid = name.match(invalidRegex) === null;
    let errMsg = '';

    if (!isNameAvailable) {
        errMsg = t('jcontent:label.contentManager.createFolderAction.exists');
    }

    if (!isNameValid) {
        errMsg = t('jcontent:label.contentManager.createFolderAction.invalidChars');
    }

    return (
        <Dialog open={open}
                aria-labelledby="form-dialog-title"
                classes={{paper: styles.root}}
                onClose={handleCancel}
                onExited={onExit}
        >
            <DialogTitle id="form-dialog-title">{t('jcontent:label.contentManager.createFolderAction.title')}</DialogTitle>
            <DialogContent>
                <DialogContentText className={errMsg ? styles.error : null}>
                    {t('jcontent:label.contentManager.createFolderAction.text')}
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
                    onClick={handleCreate}
                />
            </DialogActions>
        </Dialog>
    );
};

CreateFolderDialog.propTypes = {
    path: PropTypes.string.isRequired,
    contentType: PropTypes.string.isRequired,
    onExit: PropTypes.func.isRequired
};

