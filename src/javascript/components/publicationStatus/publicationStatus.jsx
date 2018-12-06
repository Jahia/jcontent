import React from 'react';
import Moment from 'react-moment';
import 'moment-timezone';
import {Tooltip} from '@material-ui/core';
import {isMarkedForDeletion} from '../utils';

class PublicationStatusUnpublished {
    getDetailsMessage(node, t) {
        return t('label.contentManager.publicationStatus.unPublished', {userName: node.lastPublishedBy, timestamp: node.lastPublished});
    }

    geti18nDetailsMessage(node, t, locale = 'en') {
        return (
            <React.Fragment>
                { t('label.contentManager.publicationStatus.unPublished', {userName: node.lastModifiedBy, timestamp: ''}) }
                <Moment format="LLL" locale={locale}>{node.lastModified}</Moment>
            </React.Fragment>
        );
    }

    getContentClass(classes) {
        return classes.unPublished;
    }
}

class PublicationStatusNotPublished {
    getDetailsMessage(node, t) {
        return t('label.contentManager.publicationStatus.notPublished');
    }

    geti18nDetailsMessage(node, t) {
        return t('label.contentManager.publicationStatus.notPublished');
    }

    getContentClass(classes) {
        return classes.notPublished;
    }
}

class PublicationStatusPublished {
    getDetailsMessage(node, t) {
        return t('label.contentManager.publicationStatus.published', {userName: node.lastPublishedBy, timestamp: node.lastPublished});
    }

    geti18nDetailsMessage(node, t, locale = 'en') {
        return (
            <React.Fragment>
                { t('label.contentManager.publicationStatus.published', {userName: node.lastPublishedBy, timestamp: ''}) }
                <Moment format="LLL" locale={locale}>{node.lastPublished}</Moment>
            </React.Fragment>
        );
    }

    getContentClass(classes) {
        return classes.published;
    }
}

class PublicationStatusModified {
    getDetailsMessage(node, t) {
        return t('label.contentManager.publicationStatus.modified', {userName: node.lastModifiedBy, timestamp: node.lastModified});
    }

    geti18nDetailsMessage(node, t, locale = 'en') {
        return (
            <React.Fragment>
                { t('label.contentManager.publicationStatus.modified', {userName: node.lastModifiedBy, timestamp: ''}) }
                <Moment format="LLL" locale={locale}>{node.lastModified}</Moment>
            </React.Fragment>
        );
    }

    getContentClass(classes) {
        return classes.modified;
    }
}

class PublicationStatusMarkedForDeletion {
    getDetailsMessage(node, t) {
        return t('label.contentManager.publicationStatus.markedForDeletion', {userName: node.deletedBy !== '' ? node.deletedBy : node.parentDeletionUser[0], timestamp: node.deleted !== '' ? node.deleted : node.parentDeletionDate[0]});
    }

    geti18nDetailsMessage(node, t, locale = 'en') {
        return (
            <React.Fragment>
                { t('label.contentManager.publicationStatus.markedForDeletion', {userName: node.deletedBy !== '' ? node.deletedBy : node.parentDeletionUser[0], timestamp: ''}) }
                <Moment format="LLL" locale={locale}>{node.deleted !== '' ? node.deleted : node.parentDeletionDate[0]}</Moment>
            </React.Fragment>
        );
    }

    getContentClass(classes) {
        return classes.markedForDeletion;
    }
}

class PublicationStatusMandatoryLanguageUnpublishable {
    getDetailsMessage(node, t) {
        return t('label.contentManager.publicationStatus.mandatoryLanguageUnpublishable.label');
    }

    geti18nDetailsMessage(node, t) {
        return (
            <Tooltip title={t('label.contentManager.publicationStatus.mandatoryLanguageUnpublishable.description')}>
                <span>
                    {t('label.contentManager.publicationStatus.mandatoryLanguageUnpublishable.label')}
                </span>
            </Tooltip>
        );
    }

    getContentClass(classes) {
        return classes.mandatoryLanguageUnpublishable;
    }
}

class PublicationStatusMandatoryLanguageValid {
    getDetailsMessage(node, t) {
        return t('label.contentManager.publicationStatus.mandatoryLanguageValid.label');
    }

    geti18nDetailsMessage(node, t) {
        return (
            <Tooltip title={t('label.contentManager.publicationStatus.mandatoryLanguageValid.description')}>
                <span>
                    {t('label.contentManager.publicationStatus.mandatoryLanguageValid.label')}
                </span>
            </Tooltip>
        );
    }

    getContentClass(classes) {
        return classes.mandatoryLanguageValid;
    }
}

class PublicationStatusConflict {
    getDetailsMessage(node, t) {
        return t('label.contentManager.publicationStatus.conflict.label');
    }

    geti18nDetailsMessage(node, t) {
        return (
            <Tooltip title={t('label.contentManager.publicationStatus.conflict.description')}>
                <span>
                    {t('label.contentManager.publicationStatus.conflict.label')}
                </span>
            </Tooltip>
        );
    }

    getContentClass(classes) {
        return classes.conflict;
    }
}

class PublicationStatusUnknown {
    getDetailsMessage(node, t) {
        return t('label.contentManager.publicationStatus.unknown');
    }

    geti18nDetailsMessage(node, t) {
        return t('label.contentManager.publicationStatus.unknown');
    }

    getContentClass(classes) {
        return classes.unknown;
    }
}

export const publicationStatusByName = {
    UNPUBLISHED: new PublicationStatusUnpublished(),
    NOT_PUBLISHED: new PublicationStatusNotPublished(),
    PUBLISHED: new PublicationStatusPublished(),
    MODIFIED: new PublicationStatusModified(),
    MARKED_FOR_DELETION: new PublicationStatusMarkedForDeletion(),
    MANDATORY_LANGUAGE_UNPUBLISHABLE: new PublicationStatusMandatoryLanguageUnpublishable(),
    MANDATORY_LANGUAGE_VALID: new PublicationStatusMandatoryLanguageValid(),
    CONFLICT: new PublicationStatusConflict(),
    UNKNOWN: new PublicationStatusUnknown(),
    getStatus: function (node) {
        if (isMarkedForDeletion(node)) {
            return this.MARKED_FOR_DELETION;
        }
        return this[node.publicationStatus] || this.UNKNOWN;
    }
};
