import {uploadStatuses} from '../Upload.constants';
import React from 'react';
import {CheckCircle, FiberManualRecord, Info} from '@material-ui/icons';
import {CircularProgress} from '@material-ui/core';
import {Typography} from '@jahia/design-system-kit';

const Status = ({classes, status, error, t, type}) => {
    let content;

    if (status === uploadStatuses.QUEUED) {
        content = (
            <React.Fragment>
                <FiberManualRecord className={classes.statusIcon} color="inherit"/>
                <Typography variant="zeta" className={classes.progressText} color="inherit">
                    {t('content-media-manager:label.contentManager.fileUpload.queued')}
                </Typography>
            </React.Fragment>
        );
    } else if (status === uploadStatuses.UPLOADED) {
        content = (
            <React.Fragment>
                <CheckCircle className={classes.statusIcon} color="inherit"/>
                <Typography variant="zeta" className={classes.progressText} color="inherit">
                    {type === 'import' ? t('content-media-manager:label.contentManager.fileUpload.imported') : t('content-media-manager:label.contentManager.fileUpload.uploaded')}
                </Typography>
            </React.Fragment>
        );
    } else if (status === uploadStatuses.HAS_ERROR) {
        let getErrorMessage = (error => {
            switch (error) {
                case 'WRONG_INPUT': return t('content-media-manager:label.contentManager.fileUpload.wrongInput');
                case 'FILE_EXISTS': return t('content-media-manager:label.contentManager.fileUpload.exists');
                case 'INCORRECT_SIZE': return t('content-media-manager:label.contentManager.fileUpload.cannotStore', {maxUploadSize: contextJsParameters.maxUploadSize});
                default: return type === 'import' ? t('content-media-manager:label.contentManager.fileUpload.failedImport') : t('content-media-manager:label.contentManager.fileUpload.failedUpload');
            }
        });

        content = (
            <React.Fragment>
                <Info className={classes.statusIcon} color="inherit"/>
                <Typography variant="zeta" className={classes.progressText} color="inherit">
                    {getErrorMessage(error)}
                </Typography>
            </React.Fragment>
        );
    } else if (status === uploadStatuses.UPLOADING) {
        content = (
            <React.Fragment>
                <CircularProgress size={20} className={classes.statusIcon} color="inherit"/>
                <Typography variant="zeta" className={classes.progressText} color="inherit">
                    {type === 'import' ? t('content-media-manager:label.contentManager.fileUpload.importing') : t('content-media-manager:label.contentManager.fileUpload.uploading')}
                </Typography>
            </React.Fragment>
        );
    }

    return content;
};

export default Status;
