import dayjs from 'dayjs';
import * as _ from 'lodash';

import {getDefaultLocale} from '../../JContent.utils';
import JContentConstants from '../../JContent.constants';

function tooltip(status, node, uilang, t) {
    const dateFormat = 'LLL';
    const locale = getDefaultLocale(uilang);

    if (status === 'locked') {
        const userName = (node.lockOwner && node.lockOwner.value) || '?';
        return t('label.contentManager.lockedBy', {userName});
    }

    if (status === 'markedForDeletion') {
        const userName = (node.deletedBy && node.deletedBy.value) || '?';
        const timestamp = dayjs(_.get(node, 'deleted.value', '')).locale(locale).format(dateFormat);
        return t('label.contentManager.publicationStatus.markedForDeletion', {userName, timestamp});
    }

    if (status === 'modified') {
        const userName = (node.lastModifiedBy && node.lastModifiedBy.value) || '?';
        const timestamp = dayjs(_.get(node, 'lastModified.value', '')).locale(locale).format(dateFormat);
        return t('label.contentManager.publicationStatus.modified', {userName, timestamp});
    }

    if (status === 'new') {
        return t('label.contentManager.publicationStatus.notPublished');
    }

    if (status === 'published') {
        const userName = (node.lastPublishedBy && node.lastPublishedBy.value) || '?';
        const timestamp = dayjs(_.get(node, 'lastPublished.value', '')).locale(locale).format(dateFormat);
        return t('label.contentManager.publicationStatus.published', {userName, timestamp});
    }

    if (status === 'warning') {
        switch (node.aggregatedPublicationInfo.publicationStatus) {
            case JContentConstants.availablePublicationStatuses.CONFLICT:
                return t('label.contentManager.publicationStatus.conflict.description');
            case JContentConstants.availablePublicationStatuses.MANDATORY_LANGUAGE_VALID:
                return t('label.contentManager.publicationStatus.conflict.description');
            case JContentConstants.availablePublicationStatuses.MANDATORY_LANGUAGE_UNPUBLISHABLE:
                return t('label.contentManager.publicationStatus.mandatoryLanguageUnpublishable.description');
            default:
                return t('label.contentManager.publicationStatus.unknown');
        }
    }

    if (status === 'workInProgress') {
        if (node.wipLangs) {
            return t('label.contentManager.workInProgress', {wipLang: node.wipLangs.values});
        }

        return t('label.contentManager.workInProgressAll');
    }

    return '';
}

export {tooltip};
