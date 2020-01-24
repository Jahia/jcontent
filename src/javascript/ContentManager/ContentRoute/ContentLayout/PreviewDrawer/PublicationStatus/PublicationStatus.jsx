import React from 'react';
import PropTypes from 'prop-types';
import {withTranslation} from 'react-i18next';
import {withStyles} from '@material-ui/core';
import {Typography} from '@jahia/design-system-kit';
import dayjs from 'dayjs';
import ContentManagerConstants from '../../../../ContentManager.constants';
import {lodash as _} from 'lodash';
import {connect} from 'react-redux';
import {isMarkedForDeletion, getDefaultLocale} from '../../../../ContentManager.utils';
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

export const PublicationStatus = ({previewSelection, t, classes, uilang}) => {
    if (_.isEmpty(previewSelection) || !previewSelection.operationsSupport.publication) {
        return null;
    }

    let defaultLocale = getDefaultLocale(uilang);
    // Special handling for marked for deletion content
    if (ContentManagerConstants.availablePublicationStatuses.MARKED_FOR_DELETION === previewSelection.aggregatedPublicationInfo.publicationStatus || isMarkedForDeletion(previewSelection)) {
        return (
            <Typography component="span"
                        className={classes.publicationInfoMarkedForDeletion}
            >
                {t('jcontent:label.contentManager.contentPreview.markedForDeletionBy', {userName: _.get(previewSelection, 'deletedBy.value', '')})}
            &nbsp;
                <time>{dayjs(_.get(previewSelection, 'deleted.value', '')).locale(defaultLocale).format('LLL')}</time>
            </Typography>
        );
    }

    switch (previewSelection.aggregatedPublicationInfo.publicationStatus) {
        case ContentManagerConstants.availablePublicationStatuses.MODIFIED:
            return (
                <Typography component="p"
                            className={classes.publicationInfoModified}
                >
                    {t('jcontent:label.contentManager.contentPreview.modifiedBy', {userName: _.get(previewSelection, 'lastModifiedBy.value', '')})}
                &nbsp;
                    <time>{dayjs(_.get(previewSelection, 'lastModified.value', '')).locale(defaultLocale).format('LLL')}</time>
                </Typography>
            );
        case ContentManagerConstants.availablePublicationStatuses.PUBLISHED:
            return (
                <Typography component="p"
                            className={classes.publicationInfoPublished}
                >
                    {t('jcontent:label.contentManager.contentPreview.publishedBy', {userName: _.get(previewSelection, 'lastPublishedBy.value', '')})}
                &nbsp;
                    <time>{dayjs(_.get(previewSelection, 'lastPublished.value', '')).locale(defaultLocale).format('LLL')}</time>
                </Typography>
            );
        case ContentManagerConstants.availablePublicationStatuses.NOT_PUBLISHED:
            return (
                <Typography component="p"
                            className={classes.publicationInfoNotPublished}
                >
                    {t('jcontent:label.contentManager.contentPreview.notPublished')}
                </Typography>
            );
        case ContentManagerConstants.availablePublicationStatuses.UNPUBLISHED:
            return (
                <Typography component="p"
                            className={classes.publicationInfoUnpublished}
                >
                    {t('jcontent:label.contentManager.contentPreview.unPublishedBy', {userName: _.get(previewSelection, 'lastModifiedBy.value', '')})}
                &nbsp;
                    <time>{dayjs(_.get(previewSelection, 'lastModified.value', '')).locale(defaultLocale).format('LLL')}</time>
                </Typography>
            );
        case ContentManagerConstants.availablePublicationStatuses.MANDATORY_LANGUAGE_UNPUBLISHABLE:
            return (
                <Typography component="p"
                            className={classes.publicationInfoMandatoryLanguageUnpublishable}
                            title={t('jcontent:label.contentManager.publicationStatus.mandatoryLanguageUnpublishable.description')}
                >
                    {t('jcontent:label.contentManager.publicationStatus.mandatoryLanguageUnpublishable.label')}
                </Typography>
            );
        case ContentManagerConstants.availablePublicationStatuses.MANDATORY_LANGUAGE_VALID:
            return (
                <Typography component="p"
                            className={classes.publicationInfoMandatoryLanguageValid}
                            title={t('jcontent:label.contentManager.publicationStatus.mandatoryLanguageValid.description')}
                >
                    {t('jcontent:label.contentManager.publicationStatus.mandatoryLanguageValid.label')}
                </Typography>
            );
        case ContentManagerConstants.availablePublicationStatuses.CONFLICT:
            return (
                <Typography component="p"
                            className={classes.publicationInfoConflict}
                            title={t('jcontent:label.contentManager.publicationStatus.conflict.description')}
                >
                    {t('jcontent:label.contentManager.publicationStatus.conflict.label')}
                </Typography>
            );
        default:
            return null;
    }
};

const mapStateToProps = state => ({
    uilang: state.uilang
});

PublicationStatus.propTypes = {
    classes: PropTypes.object.isRequired,
    previewSelection: PropTypes.object.isRequired,
    t: PropTypes.func.isRequired,
    uilang: PropTypes.string.isRequired
};

export default compose(
    withTranslation(),
    withStyles(styles),
    connect(mapStateToProps)
)(PublicationStatus);
