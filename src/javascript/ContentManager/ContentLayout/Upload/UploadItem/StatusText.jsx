import {uploadStatuses} from '../Upload.constants';
import React from 'react';
import {CheckCircle, FiberManualRecord, Info} from '@material-ui/icons';
import {CircularProgress, Typography} from '@material-ui/core';

const StatusText = ({classes, status, error, t, type}) => {

    if (status === uploadStatuses.QUEUED) {
        return (
            <React.Fragment>
                <FiberManualRecord className={classes.statusIcon} color="inherit"/>
                <Typography variant="subtitle2" className={classes.progressText} color="inherit">
                    {t('label.contentManager.fileUpload.queued')}
                </Typography>
            </React.Fragment>
        );
    } else if (status === uploadStatuses.UPLOADED) {
        return (
            <React.Fragment>
                <CheckCircle className={classes.statusIcon} color="inherit"/>
                <Typography variant="subtitle2" className={classes.progressText} color="inherit">
                    {type === 'import' ? t('label.contentManager.fileUpload.imported') : t('label.contentManager.fileUpload.uploaded')}
                </Typography>
            </React.Fragment>
        );
    } else if (status === uploadStatuses.HAS_ERROR) {
        let getErrorMessage = (error => {
            switch (error) {
                case 'WRONG_INPUT': return t('label.contentManager.fileUpload.wrongInput');
                case 'FILE_EXISTS': return t('label.contentManager.fileUpload.exists');
                case 'INCORRECT_SIZE': return t('label.contentManager.fileUpload.cannotStore', {maxUploadSize: contextJsParameters.maxUploadSize});
                default: return type === 'import' ? t('label.contentManager.fileUpload.failedImport') : t('label.contentManager.fileUpload.failedUpload');
            }
        });

        return (
            <React.Fragment>
                <Info className={classes.statusIcon} color="inherit"/>
                <Typography variant="subtitle2" className={classes.progressText} color="inherit">
                    {getErrorMessage(error)}
                </Typography>
            </React.Fragment>
        );
    } else if (status === uploadStatuses.UPLOADING) {
        return (
            <React.Fragment>
                <CircularProgress size={20} className={classes.statusIcon} color="inherit"/>
                <Typography variant="subtitle2" className={classes.progressText} color="inherit">
                    {type === 'import' ? t('label.contentManager.fileUpload.importing') : t('label.contentManager.fileUpload.uploading')}
                </Typography>
            </React.Fragment>
        );
    }
};

export default StatusText;
