import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import {CircularProgress, withStyles} from '@material-ui/core';
import {Typography} from '@jahia/design-system-kit';
import {CheckCircle, Info} from '@material-ui/icons';
import {compose} from 'react-apollo';
import {withTranslation, Trans} from 'react-i18next';

let styles = theme => ({
    headerText: {
        color: theme.palette.text.contrastText,
        display: 'flex',
        alignItems: 'center',
        marginBottom: '16px'
    },
    statusIcon: {
        marginRight: theme.spacing.unit
    },
    link: {
        color: 'inherit'
    }
});

export function UploadHeader({classes, t, status}) {
    if (!status) {
        return null;
    }

    if (status.uploading !== 0) {
        return (
            <div className={classNames(classes.headerText)}>
                <CircularProgress size={20} color="inherit" className={classes.statusIcon}/>
                <Typography color="inherit" data-cm-role="upload-status-uploading">
                    {t(status.type === 'import' ? 'label.contentManager.fileUpload.importingMessage' : 'label.contentManager.fileUpload.uploadingMessage', {
                        uploaded: status.uploaded,
                        total: status.total
                    })}
                </Typography>
                {(status.error !== 0) &&
                    <Typography color="inherit">
                        {t('content-media-manager:label.contentManager.fileUpload.uploadingActionMessage')}
                    </Typography>}
            </div>
        );
    }

    if (status.error !== 0) {
        return (
            <div className={classNames(classes.headerText)}>
                <Info className={classNames(classes.statusIcon)}/>
                <Typography color="inherit" data-cm-role="upload-status-error">
                    {status.type === 'import' ?
                        <Trans i18nKey="label.contentManager.fileUpload.importErrorMessage"
                               components={[
                                   <a key="importAcademyLink"
                                      href={contextJsParameters.config.importAcademyLink}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className={classes.link}
                                   >.
                                   </a>
                               ]}/> : t('content-media-manager:label.contentManager.fileUpload.errorMessage')}
                </Typography>
            </div>
        );
    }

    return (
        <div className={classNames(classes.headerText)}>
            <CheckCircle className={classNames(classes.statusIcon)}/>
            <Typography color="inherit" data-cm-role="upload-status-success">
                {t(status.type === 'import' ? 'content-media-manager:label.contentManager.fileUpload.successfulImportMessage' : 'content-media-manager:label.contentManager.fileUpload.successfulUploadMessage', {
                    count: status.total,
                    number: status.total
                })}
            </Typography>
        </div>
    );
}

UploadHeader.propTypes = {
    classes: PropTypes.object.isRequired,
    status: PropTypes.object,
    t: PropTypes.func.isRequired
};

export default compose(
    withStyles(styles, {withTheme: true}),
    withTranslation()
)(UploadHeader);
