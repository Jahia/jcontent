import {uploadStatuses} from '../Upload.constants';
import React from 'react';
import {AddCircle, Check, Information, Loader} from '@jahia/moonstone';
import {Typography} from '@jahia/design-system-kit';

const Status = ({classes, status, error, t, type}) => {
    let content;

    if (status === uploadStatuses.QUEUED) {
        content = (
            <React.Fragment>
                <AddCircle className={classes.statusIcon} color="inherit"/>
                <Typography variant="zeta" className={classes.progressText} color="inherit">
                    {t('jcontent:label.contentManager.fileUpload.queued')}
                </Typography>
            </React.Fragment>
        );
    } else if (status === uploadStatuses.UPLOADED) {
        content = (
            <React.Fragment>
                <Check className={classes.statusIcon} color="inherit"/>
                <Typography variant="zeta" className={classes.progressText} color="inherit">
                    {type === 'import' ? t('jcontent:label.contentManager.fileUpload.imported') : t('jcontent:label.contentManager.fileUpload.uploaded')}
                </Typography>
            </React.Fragment>
        );
    } else if (status === uploadStatuses.HAS_ERROR) {
        let getErrorMessage = (error => {
            switch (error) {
                case 'WRONG_INPUT': return t('jcontent:label.contentManager.fileUpload.wrongInput');
                case 'FILE_EXISTS': return t('jcontent:label.contentManager.fileUpload.exists');
                case 'INCORRECT_SIZE': return t('jcontent:label.contentManager.fileUpload.cannotStore', {maxUploadSize: contextJsParameters.maxUploadSize});
                default: return type === 'import' ? t('jcontent:label.contentManager.fileUpload.failedImport') : t('jcontent:label.contentManager.fileUpload.failedUpload');
            }
        });

        content = (
            <React.Fragment>
                <Information className={classes.statusIcon} color="inherit"/>
                <Typography variant="zeta" className={classes.progressText} color="inherit">
                    {getErrorMessage(error)}
                </Typography>
            </React.Fragment>
        );
    } else if (status === uploadStatuses.UPLOADING) {
        content = (
            <React.Fragment>
                <Loader isReversed size="small" className={classes.statusIcon}/>
                <Typography variant="zeta" className={classes.progressText} color="inherit">
                    {type === 'import' ? t('jcontent:label.contentManager.fileUpload.importing') : t('jcontent:label.contentManager.fileUpload.uploading')}
                </Typography>
            </React.Fragment>
        );
    }

    return content;
};

export default Status;
