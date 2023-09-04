import React, {useCallback, useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import {Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField} from '@material-ui/core';
import {Button, Typography} from '@jahia/moonstone';
import {useTranslation} from 'react-i18next';
import SecondaryActionsList from './SecondaryActionsList';
import Status from './Status';
import EditButton from './EditButton';
import {registry} from '@jahia/ui-extender';
import JContentConstants from '~/JContent/JContent.constants';
import styles from './UploadItem.scss';
import {useApolloClient} from '@apollo/client';
import {useDispatch} from 'react-redux';
import {
    NUMBER_OF_SIMULTANEOUS_UPLOADS,
    uploadStatuses
} from '~/JContent/ContentRoute/ContentLayout/Upload/Upload.constants';
import {batchActions} from 'redux-batched-actions';
import {
    fileuploadRemoveUpload,
    fileuploadTakeFromQueue,
    fileuploadUpdateUpload
} from '~/JContent/ContentRoute/ContentLayout/Upload/Upload.redux';
import {createMissingFolders, onFilesSelected} from '~/JContent/ContentRoute/ContentLayout/Upload/Upload.utils';

const UPLOAD_DELAY = 200;

export const UploadItem = ({upload, index}) => {
    const [userChosenName, setUserChosenName] = useState();
    const [modalAnchor, setModalAnchor] = useState();
    const [component, setComponent] = useState();
    const [uuid, setUuid] = useState();

    const dispatch = useDispatch();

    const {t} = useTranslation();
    const {file, entry} = upload;
    const client = useApolloClient();

    const getFileName = useCallback(() => userChosenName ? userChosenName : (file ? file.name : entry.name).normalize('NFC'), [entry, file, userChosenName]);

    const fileName = getFileName();
    const isNameSizeValid = fileName && fileName.length <= contextJsParameters.config.maxNameSize;
    const isNameCharsValid = fileName.match(JContentConstants.namingInvalidCharactersRegexp) === null;
    let errMsg = '';

    if (!isNameSizeValid) {
        errMsg = t('jcontent:label.contentManager.fileUpload.fileNameSizeExceedLimit', {maxNameSize: contextJsParameters.config.maxNameSize});
    }

    if (!isNameCharsValid) {
        errMsg = t('jcontent:label.contentManager.fileUpload.invalidChars');
    }

    const handleUpload = useCallback(type => {
        const {file, path} = upload;
        const normalizedPath = path.normalize('NFC');
        if (type === 'import') {
            return registry.get('fileUpload', 'import').handleUpload({path: normalizedPath, file, client});
        }

        if (type === 'replace') {
            let newPath = `${normalizedPath}/${getFileName()}`;
            return registry.get('fileUpload', 'replace').handleUpload({path: newPath, file, client});
        }

        if (type === 'replaceWith') {
            return registry.get('fileUpload', 'replace').handleUpload({path: normalizedPath, file, client});
        }

        const filename = getFileName();
        return registry.get('fileUpload', 'default').handleUpload({path: normalizedPath, file, filename, client});
    }, [client, getFileName, upload]);

    const doUploadAndStatusUpdate = useCallback((type = upload.type) => {
        const newUpload = {
            id: upload.id,
            status: null,
            error: null,
            path: upload.path,
            type: upload.type,
            uuid: null
        };
        try {
            handleUpload(type).then(uploadReturnObj => {
                newUpload.status = uploadStatuses.UPLOADED;
                newUpload.uuid = uploadReturnObj.uuid;

                setTimeout(() => {
                    dispatch(batchActions([fileuploadUpdateUpload(newUpload), fileuploadTakeFromQueue(NUMBER_OF_SIMULTANEOUS_UPLOADS)]));

                    const {component, uuid} = uploadReturnObj;
                    if (typeof component !== 'undefined' && component !== null && React.isValidElement(component)) {
                        setComponent(component);
                    }

                    if (typeof uuid !== 'undefined' && uuid !== null) {
                        setUuid(uuid);
                    }
                }, UPLOAD_DELAY);
            }).catch(e => {
                // Server side errors
                newUpload.status = uploadStatuses.HAS_ERROR;

                if (e.message.indexOf('GqlJcrWrongInputException') !== -1) {
                    newUpload.error = 'WRONG_INPUT';
                }

                if (e.message.indexOf('ItemExistsException') !== -1) {
                    newUpload.error = 'FILE_EXISTS';
                }

                if (e.message.indexOf('FileSizeLimitExceededException') !== -1) {
                    newUpload.error = 'INCORRECT_SIZE';
                }

                setTimeout(() => {
                    dispatch(batchActions([fileuploadUpdateUpload(newUpload), fileuploadTakeFromQueue(NUMBER_OF_SIMULTANEOUS_UPLOADS)]));
                }, UPLOAD_DELAY);
            });
        } catch (error) {
            // Client side errors
            newUpload.status = uploadStatuses.HAS_ERROR;
            newUpload.error = error.message;

            setTimeout(() => {
                dispatch(batchActions([fileuploadUpdateUpload(newUpload), fileuploadTakeFromQueue(NUMBER_OF_SIMULTANEOUS_UPLOADS)]));
            }, UPLOAD_DELAY);
        }
    }, [dispatch, handleUpload, upload]);

    const changeStatusToUploading = useCallback(() => {
        if (upload.isFolder) {
            dispatch(fileuploadRemoveUpload(index));
            upload.subEntries.forEach(file => {
                file.path = file.path.replace(upload.path + '/' + upload.entry.name, upload.path + '/' + userChosenName);
                file.entryPath = file.path + '/' + (file.userChosenName || file.entry.name).normalize('NFC');
                file.invalidParents.splice(file.invalidParents.indexOf(upload.entry), 1);
            });
            upload.userChosenName = userChosenName;
            upload.error = null;
            upload.entryPath = (upload.path + '/' + userChosenName).normalize('NFC');
            if (!upload.invalidParents || upload.invalidParents.length === 0) {
                const subEntries = upload.subEntries.filter(f => f.invalidParents.length === 0);
                const missingFolders = [upload, ...subEntries.filter(f => f.isFolder && !f.error)];
                createMissingFolders(client, missingFolders).then(() => {
                    // Handle file upload and directory creation
                    const acceptedFiles = subEntries.filter(f => !f.isFolder);
                    if (acceptedFiles.length > 0) {
                        onFilesSelected({
                            acceptedFiles,
                            dispatchBatch: actions => dispatch(batchActions(actions)),
                            type: 'upload'
                        });
                    }
                });
            }
        } else {
            const newUpload = {
                id: upload.id,
                status: uploadStatuses.UPLOADING,
                error: null,
                path: upload.path
            };
            dispatch(fileuploadUpdateUpload(newUpload));
        }
    }, [upload, dispatch, index, userChosenName, client]);

    useEffect(() => {
        if (upload.status === uploadStatuses.UPLOADING) {
            doUploadAndStatusUpdate();
        }
    }, [doUploadAndStatusUpdate, upload]);

    return (
        <div className={styles.listItem}>
            <Typography className={styles.fileNameText}>
                {fileName}
            </Typography>
            <SecondaryActionsList upload={upload}
                                  index={index}
                                  doUploadAndStatusUpdate={doUploadAndStatusUpdate}
                                  showRenameDialog={e => setModalAnchor(e.currentTarget)}
            />
            <div className={styles.grow}/>
            <Status upload={upload}/>
            {component}
            {file && <EditButton upload={upload} uuid={uuid}/>}
            <Dialog open={modalAnchor}>
                <DialogTitle>
                    {t('jcontent:label.contentManager.fileUpload.dialogRenameTitle')}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        {t('jcontent:label.contentManager.fileUpload.dialogRenameText')}
                    </DialogContentText>
                    <TextField
                        fullWidth
                        autoFocus
                        error={Boolean(errMsg)}
                        label={t('jcontent:label.contentManager.fileUpload.newName')}
                        type="text"
                        id="rename-dialog-text"
                        name={t('jcontent:label.contentManager.fileUpload.dialogRenameExample')}
                        helperText={errMsg}
                        defaultValue={(file ? file.name : entry.name).normalize('NFC')}
                        onChange={e => setUserChosenName(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button label={t('jcontent:label.contentManager.fileUpload.dialogRenameCancel')}
                            data-cm-role="rename-dialog-cancel"
                            size="big"
                            onClick={() => setModalAnchor(null)}/>
                    <Button label={t('jcontent:label.contentManager.fileUpload.dialogRename')}
                            data-cm-role="rename-dialog"
                            size="big"
                            color="accent"
                            isDisabled={Boolean(errMsg)}
                            onClick={() => {
                                setModalAnchor(null);
                                changeStatusToUploading();
                            }}/>
                </DialogActions>
            </Dialog>
        </div>
    );
};

UploadItem.propTypes = {
    index: PropTypes.number,
    upload: PropTypes.object.isRequired
};

export default UploadItem;
