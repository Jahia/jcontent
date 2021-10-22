import React from 'react';
import PropTypes from 'prop-types';
import {useTranslation} from 'react-i18next';
import {Typography} from '@jahia/design-system-kit';
import dayjs from 'dayjs';
import JContentConstants from '~/JContent/JContent.constants';
import {lodash as _} from 'lodash';
import {useSelector} from 'react-redux';
import {getDefaultLocale, isMarkedForDeletion} from '~/JContent/JContent.utils';

import styles from './PublicationStatus.scss';

export const PublicationStatus = ({previewSelection}) => {
    const {t} = useTranslation();
    const uilang = useSelector(state => state.uilang);

    if (_.isEmpty(previewSelection) || !previewSelection.operationsSupport.publication) {
        return null;
    }

    let defaultLocale = getDefaultLocale(uilang);
    // Special handling for marked for deletion content
    if (JContentConstants.availablePublicationStatuses.MARKED_FOR_DELETION === previewSelection.aggregatedPublicationInfo.publicationStatus || isMarkedForDeletion(previewSelection)) {
        return (
            <Typography component="span"
                        className={styles.publicationInfoMarkedForDeletion}
            >
                {t('jcontent:label.contentManager.contentPreview.markedForDeletionBy', {userName: _.get(previewSelection, 'deletedBy.value', '')})}
            &nbsp;
                <time>{dayjs(_.get(previewSelection, 'deleted.value', '')).locale(defaultLocale).format('LLL')}</time>
            </Typography>
        );
    }

    switch (previewSelection.aggregatedPublicationInfo.publicationStatus) {
        case JContentConstants.availablePublicationStatuses.MODIFIED:
            return (
                <Typography component="p"
                            className={styles.publicationInfoModified}
                >
                    {t('jcontent:label.contentManager.contentPreview.modifiedBy', {userName: _.get(previewSelection, 'lastModifiedBy.value', '')})}
                &nbsp;
                    <time>{dayjs(_.get(previewSelection, 'lastModified.value', '')).locale(defaultLocale).format('LLL')}</time>
                </Typography>
            );
        case JContentConstants.availablePublicationStatuses.PUBLISHED:
            return (
                <Typography component="p"
                            className={styles.publicationInfoPublished}
                >
                    {t('jcontent:label.contentManager.contentPreview.publishedBy', {userName: _.get(previewSelection, 'lastPublishedBy.value', '')})}
                &nbsp;
                    <time>{dayjs(_.get(previewSelection, 'lastPublished.value', '')).locale(defaultLocale).format('LLL')}</time>
                </Typography>
            );
        case JContentConstants.availablePublicationStatuses.NOT_PUBLISHED:
            return (
                <Typography component="p"
                            className={styles.publicationInfoNotPublished}
                >
                    {t('jcontent:label.contentManager.contentPreview.notPublished')}
                </Typography>
            );
        case JContentConstants.availablePublicationStatuses.UNPUBLISHED:
            return (
                <Typography component="p"
                            className={styles.publicationInfoUnpublished}
                >
                    {t('jcontent:label.contentManager.contentPreview.unPublishedBy', {userName: _.get(previewSelection, 'lastModifiedBy.value', '')})}
                &nbsp;
                    <time>{dayjs(_.get(previewSelection, 'lastModified.value', '')).locale(defaultLocale).format('LLL')}</time>
                </Typography>
            );
        case JContentConstants.availablePublicationStatuses.MANDATORY_LANGUAGE_UNPUBLISHABLE:
            return (
                <Typography component="p"
                            className={styles.publicationInfoMandatoryLanguageUnpublishable}
                            title={t('jcontent:label.contentManager.publicationStatus.mandatoryLanguageUnpublishable.description')}
                >
                    {t('jcontent:label.contentManager.publicationStatus.mandatoryLanguageUnpublishable.label')}
                </Typography>
            );
        case JContentConstants.availablePublicationStatuses.MANDATORY_LANGUAGE_VALID:
            return (
                <Typography component="p"
                            className={styles.publicationInfoMandatoryLanguageValid}
                            title={t('jcontent:label.contentManager.publicationStatus.mandatoryLanguageValid.description')}
                >
                    {t('jcontent:label.contentManager.publicationStatus.mandatoryLanguageValid.label')}
                </Typography>
            );
        case JContentConstants.availablePublicationStatuses.CONFLICT:
            return (
                <Typography component="p"
                            className={styles.publicationInfoConflict}
                            title={t('jcontent:label.contentManager.publicationStatus.conflict.description')}
                >
                    {t('jcontent:label.contentManager.publicationStatus.conflict.label')}
                </Typography>
            );
        default:
            return null;
    }
};

PublicationStatus.propTypes = {
    previewSelection: PropTypes.object.isRequired,
};

export default PublicationStatus;
