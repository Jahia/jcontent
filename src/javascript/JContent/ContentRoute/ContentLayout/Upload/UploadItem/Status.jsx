import {uploadStatuses} from '../Upload.constants';
import React from 'react';
import {AddCircle, Check, Information, Loader, Typography} from '@jahia/moonstone';
import styles from './UploadItem.scss';
import {useTranslation} from 'react-i18next';

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
        let getErrorMessage = (error => {
            switch (error) {
                case 'WRONG_INPUT': return t('jcontent:label.contentManager.fileUpload.wrongInput');
                case 'FILE_EXISTS': return t('jcontent:label.contentManager.fileUpload.exists');
                case 'FILE_NAME_INVALID': return t('jcontent:label.contentManager.fileUpload.invalidChars');
                case 'FILE_NAME_SIZE': return t('jcontent:label.contentManager.fileUpload.fileNameSizeExceedLimit', {maxNameSize: contextJsParameters.config.maxNameSize});
                case 'FOLDER_CONFLICT': return t('jcontent:label.contentManager.fileUpload.folderExists');
                case 'FOLDER_FILE_NAME_INVALID': return t('jcontent:label.contentManager.fileUpload.invalidChars');
                case 'FOLDER_FILE_NAME_SIZE': return t('jcontent:label.contentManager.fileUpload.fileNameSizeExceedLimit', {maxNameSize: contextJsParameters.config.maxNameSize});
                case 'INCORRECT_SIZE': return t('jcontent:label.contentManager.fileUpload.cannotStore', {maxUploadSize: contextJsParameters.maxUploadSize});
                default: return type === 'import' ? t('jcontent:label.contentManager.fileUpload.failedImport') : t('jcontent:label.contentManager.fileUpload.failedUpload');
            }
        });

        content = (
            <React.Fragment>
                <Information className={styles.statusIcon} color="inherit"/>
                <Typography className={styles.progressText} weight="bold">
                    {getErrorMessage(error)}
                </Typography>
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
