import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'clsx';
import {Check, Information, Loader, Typography} from '@jahia/moonstone';
import {Trans, useTranslation} from 'react-i18next';
import styles from './UploadHeader.scss';

export const UploadHeader = ({status}) => {
    const {t} = useTranslation('jcontent');
    if (!status) {
        return null;
    }

    if (status.uploading !== 0) {
        return (
            <div className={classNames(styles.headerText)}>
                <Loader isReversed size="small" className={styles.statusIcon}/>
                <Typography data-cm-role="upload-status-uploading">
                    {t(status.type === 'import' ? 'jcontent:label.contentManager.fileUpload.importingMessage' : 'jcontent:label.contentManager.fileUpload.uploadingMessage', {
                        uploaded: status.uploaded,
                        total: status.total
                    })}
                </Typography>
                {(status.error !== 0) &&
                <Typography>
                    {t('jcontent:label.contentManager.fileUpload.uploadingActionMessage')}
                </Typography>}
            </div>
        );
    }

    if (status.error !== 0) {
        return (
            <div className={classNames(styles.headerText)}>
                <Information className={classNames(styles.statusIcon)}/>
                <Typography data-cm-role="upload-status-error">
                    {status.type === 'import' ?
                        <Trans i18nKey="jcontent:label.contentManager.fileUpload.importErrorMessage"
                               components={[
                                   <a key="importAcademyLink"
                                      href={window.contextJsParameters.config.links.importAcademy}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className={styles.link}
                                   >.
                                   </a>
                               ]}/> : t('jcontent:label.contentManager.fileUpload.errorMessage')}
                </Typography>
            </div>
        );
    }

    return (
        <div className={classNames(styles.headerText)}>
            <Check className={classNames(styles.statusIcon)}/>
            <Typography data-cm-role="upload-status-success">
                {t(status.type === 'import' ? 'jcontent:label.contentManager.fileUpload.successfulImportMessage' : 'jcontent:label.contentManager.fileUpload.successfulUploadMessage', {
                    count: status.total,
                    number: status.total
                })}
            </Typography>
        </div>
    );
};

UploadHeader.propTypes = {
    status: PropTypes.object
};

export default UploadHeader;
