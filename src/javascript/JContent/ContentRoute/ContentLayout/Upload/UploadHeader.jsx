import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import {withStyles} from '@material-ui/core';
import {Check, Information, Loader, Typography} from '@jahia/moonstone';
import {compose} from '~/utils';
import {Trans, withTranslation} from 'react-i18next';

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
                <Loader isReversed size="small" className={classes.statusIcon}/>
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
            <div className={classNames(classes.headerText)}>
                <Information className={classNames(classes.statusIcon)}/>
                <Typography data-cm-role="upload-status-error">
                    {status.type === 'import' ?
                        <Trans i18nKey="jcontent:label.contentManager.fileUpload.importErrorMessage"
                               components={[
                                   <a key="importAcademyLink"
                                      href={window.contextJsParameters.config.links.importAcademy}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className={classes.link}
                                   >.
                                   </a>
                               ]}/> : t('jcontent:label.contentManager.fileUpload.errorMessage')}
                </Typography>
            </div>
        );
    }

    return (
        <div className={classNames(classes.headerText)}>
            <Check className={classNames(classes.statusIcon)}/>
            <Typography data-cm-role="upload-status-success">
                {t(status.type === 'import' ? 'jcontent:label.contentManager.fileUpload.successfulImportMessage' : 'jcontent:label.contentManager.fileUpload.successfulUploadMessage', {
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
