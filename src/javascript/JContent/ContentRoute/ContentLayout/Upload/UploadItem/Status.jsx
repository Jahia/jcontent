import {uploadErrors, uploadStatuses} from '../Upload.constants';
import React from 'react';
import {AddCircle, Check, Information, Loader, Typography} from '@jahia/moonstone';
import styles from './UploadItem.scss';
import {useTranslation} from 'react-i18next';

function getErrorMessages(uploadType, error, t) {
    switch (error.type) {
        case uploadErrors.WRONG_INPUT: return [t('jcontent:label.contentManager.fileUpload.wrongInput')];
        case uploadErrors.FILE_EXISTS: return [t('jcontent:label.contentManager.fileUpload.exists')];
        case uploadErrors.FILE_NAME_INVALID: return [t('jcontent:label.contentManager.fileUpload.invalidChars')];
        case uploadErrors.FILE_NAME_SIZE: return [t('jcontent:label.contentManager.fileUpload.fileNameSizeExceedLimit', {maxNameSize: contextJsParameters.config.maxNameSize})];
        case uploadErrors.FOLDER_CONFLICT: return [t('jcontent:label.contentManager.fileUpload.folderExists')];
        case uploadErrors.FOLDER_FILE_NAME_INVALID: return [t('jcontent:label.contentManager.fileUpload.invalidChars')];
        case uploadErrors.FOLDER_FILE_NAME_SIZE: return [t('jcontent:label.contentManager.fileUpload.fileNameSizeExceedLimit', {maxNameSize: contextJsParameters.config.maxNameSize})];
        case uploadErrors.INCORRECT_SIZE: return [t('jcontent:label.contentManager.fileUpload.cannotStore', {maxUploadSize: contextJsParameters.config.maxUploadSize})];
        case uploadErrors.CONSTRAINT_VIOLATION: return (error.messages?.length) ? error.messages : [t('jcontent:label.contentManager.fileUpload.constraintViolation')];
        default: return uploadType === 'import' ? [t('jcontent:label.contentManager.fileUpload.failedImport')] : [t('jcontent:label.contentManager.fileUpload.failedUpload')];
    }
}

const Status = ({upload}) => {
    const {status, error, type} = upload;
    const {t} = useTranslation('jcontent');
    let content;

    if (status === uploadStatuses.QUEUED) {
        content = (
            <React.Fragment>
                <AddCircle className={styles.statusIcon} color="inherit"/>
                <Typography className={styles.progressText} weight="bold">
                    {t('jcontent:label.contentManager.fileUpload.queued')}
                </Typography>
            </React.Fragment>
        );
    } else if (status === uploadStatuses.UPLOADED) {
        content = (
            <React.Fragment>
                <Check className={styles.statusIcon} color="inherit"/>
                <Typography className={styles.progressText} weight="bold">
                    {type === 'import' ? t('jcontent:label.contentManager.fileUpload.imported') : t('jcontent:label.contentManager.fileUpload.uploaded')}
                </Typography>
            </React.Fragment>
        );
    } else if (status === uploadStatuses.HAS_ERROR) {
        content = (
            <React.Fragment>
                <Information className={styles.statusIcon} color="inherit"/>
                <div className={styles.uploadErrors}>
                    {getErrorMessages(type, error, t).map(message => (
                        <Typography key={message} className={styles.progressText} weight="bold" data-sel-role="upload-error-msg">
                            {message}
                        </Typography>
                    ))}
                </div>
            </React.Fragment>
        );
    } else if (status === uploadStatuses.UPLOADING) {
        content = (
            <React.Fragment>
                <Loader isReversed size="small" className={styles.statusIcon}/>
                <Typography className={styles.progressText} weight="bold">
                    {type === 'import' ? t('jcontent:label.contentManager.fileUpload.importing') : t('jcontent:label.contentManager.fileUpload.uploading')}
                </Typography>
            </React.Fragment>
        );
    }

    return content;
};

export default Status;
