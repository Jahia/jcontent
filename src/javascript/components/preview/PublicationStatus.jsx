import React from 'react';
import {translate} from 'react-i18next';
import {Typography, withStyles} from '@material-ui/core';
import Moment from 'react-moment';
import 'moment-timezone';
import Constants from '../constants';
import {lodash as _} from 'lodash';
import {connect} from 'react-redux';
import {isMarkedForDeletion} from '../utils';
import {compose} from 'react-apollo';

// TODO Here as well as in ContentListTable unpublished status is not clear

const styles = theme => ({
    publicationInfoModified: {
        borderLeft: '5px solid ' + theme.palette.publicationStatus.modified.main,
        padding: theme.spacing.unit
    },
    publicationInfoNotPublished: {
        borderLeft: '5px solid ' + theme.palette.publicationStatus.notPublished.main,
        padding: theme.spacing.unit
    },
    publicationInfoPublished: {
        borderLeft: '5px solid ' + theme.palette.publicationStatus.published.main,
        padding: theme.spacing.unit
    },
    publicationInfoMarkedForDeletion: {
        borderLeft: '5px solid ' + theme.palette.publicationStatus.markedForDeletion.main,
        color: theme.palette.publicationStatus.markedForDeletion.main,
        padding: theme.spacing.unit
    },
    publicationInfoUnpublished: {
        borderLeft: '5px solid ' + theme.palette.publicationStatus.unpublished.main,
        padding: theme.spacing.unit
    },
    publicationInfoMandatoryLanguageUnpublishable: {
        borderLeft: '5px solid ' + theme.palette.publicationStatus.mandatoryLanguageUnpublishable.main,
        padding: theme.spacing.unit
    },
    publicationInfoMandatoryLanguageValid: {
        borderLeft: '5px solid ' + theme.palette.publicationStatus.mandatoryLanguageValid.main,
        padding: theme.spacing.unit
    },
    publicationInfoConflict: {
        borderLeft: '5px solid ' + theme.palette.publicationStatus.conflict.main,
        padding: theme.spacing.unit
    }
});

const PublicationStatus = ({selection, t, classes, uiLang}) => {
    if (_.isEmpty(selection)) {
        return null;
    }
    const selectedItem = selection;
    // Special handling for marked for deletion content
    if (Constants.availablePublicationStatuses.MARKED_FOR_DELETION === selectedItem.publicationStatus || isMarkedForDeletion(selectedItem)) {
        return (
            <Typography color="textSecondary"
                        component="span"
                        className={classes.publicationInfoMarkedForDeletion}
            >
                {t('label.contentManager.contentPreview.markedForDeletionBy', {userName: selectedItem.deletedBy})}
            &nbsp;
                <Moment format="LLL" locale={uiLang}>{selectedItem.deleted}</Moment>
            </Typography>
        );
    }
    switch (selectedItem.publicationStatus) {
        case Constants.availablePublicationStatuses.MODIFIED:
            return (
                <Typography color="textSecondary"
                            component="p"
                            className={classes.publicationInfoModified}
                >
                    {t('label.contentManager.contentPreview.modifiedBy', {userName: selectedItem.lastModifiedBy})}
                &nbsp;
                    <Moment format="LLL" locale={uiLang}>{selectedItem.lastModified}</Moment>
                </Typography>
            );
        case Constants.availablePublicationStatuses.PUBLISHED:
            return (
                <Typography color="textSecondary"
                            component="p"
                            className={classes.publicationInfoPublished}
                >
                    {t('label.contentManager.contentPreview.publishedBy', {userName: selectedItem.lastPublishedBy})}
                &nbsp;
                    <Moment format="LLL" locale={uiLang}>{selectedItem.lastPublished}</Moment>
                </Typography>
            );
        case Constants.availablePublicationStatuses.NOT_PUBLISHED:
            return (
                <Typography color="textSecondary"
                            component="p"
                            className={classes.publicationInfoNotPublished}
                >
                    {t('label.contentManager.contentPreview.notPublished')}
                </Typography>
            );
        case Constants.availablePublicationStatuses.UNPUBLISHED:
            return (
                <Typography color="textSecondary"
                            component="p"
                            className={classes.publicationInfoUnpublished}
                >
                    {t('label.contentManager.contentPreview.unPublishedBy', {userName: selectedItem.lastModifiedBy})}
                &nbsp;
                    <Moment format="LLL" locale={uiLang}>{selectedItem.lastModified}</Moment>
                </Typography>
            );
        case Constants.availablePublicationStatuses.MANDATORY_LANGUAGE_UNPUBLISHABLE:
            return (
                <Typography color="textSecondary"
                            component="p"
                            className={classes.publicationInfoMandatoryLanguageUnpublishable}
                            title={t('label.contentManager.publicationStatus.mandatoryLanguageUnpublishable.description')}
                >
                    {t('label.contentManager.publicationStatus.mandatoryLanguageUnpublishable.label')}
                </Typography>
            );
        case Constants.availablePublicationStatuses.MANDATORY_LANGUAGE_VALID:
            return (
                <Typography color="textSecondary"
                            component="p"
                            className={classes.publicationInfoMandatoryLanguageValid}
                            title={t('label.contentManager.publicationStatus.mandatoryLanguageValid.description')}
                >
                    {t('label.contentManager.publicationStatus.mandatoryLanguageValid.label')}
                </Typography>
            );
        case Constants.availablePublicationStatuses.CONFLICT:
            return (
                <Typography color="textSecondary"
                            component="p"
                            className={classes.publicationInfoConflict}
                            title={t('label.contentManager.publicationStatus.conflict.description')}
                >
                    {t('label.contentManager.publicationStatus.conflict.label')}
                </Typography>
            );
        default:
            return null;
    }
};

const mapStateToProps = state => ({
    uiLang: state.uiLang
});

export default compose(
    translate(),
    withStyles(styles),
    connect(mapStateToProps)
)(PublicationStatus);
