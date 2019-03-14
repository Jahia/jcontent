import React from 'react';
import Moment from 'react-moment';
import 'moment-timezone';
import {Tooltip} from '@material-ui/core';
import {isMarkedForDeletion} from '../../../ContentManager.utils';
import * as _ from 'lodash';

class PublicationStatusUnpublished {
    geti18nDetailsMessage(node, t, locale = 'en') {
        return (
            <React.Fragment>
                { t('label.contentManager.publicationStatus.unPublished', {userName: _.get(node, 'lastModifiedBy.value', ''), timestamp: ''}) }
                <Moment format="LLL" locale={locale}>{_.get(node, 'lastModified.value', '')}</Moment>
            </React.Fragment>
        );
    }

    getContentClass(classes) {
        return classes.unPublished;
    }
}

class PublicationStatusNotPublished {
    geti18nDetailsMessage(node, t) {
        return t('label.contentManager.publicationStatus.notPublished');
    }

    getContentClass(classes) {
        return classes.notPublished;
    }
}

class PublicationStatusPublished {
    geti18nDetailsMessage(node, t, locale = 'en') {
        return (
            <React.Fragment>
                { t('label.contentManager.publicationStatus.published', {userName: _.get(node, 'lastPublishedBy.value', ''), timestamp: ''}) }
                <Moment format="LLL" locale={locale}>{_.get(node, 'lastPublished.value', '')}</Moment>
            </React.Fragment>
        );
    }

    getContentClass(classes) {
        return classes.published;
    }
}

class PublicationStatusModified {
    geti18nDetailsMessage(node, t, locale = 'en') {
        return (
            <React.Fragment>
                { t('label.contentManager.publicationStatus.modified', {userName: _.get(node, 'lastModifiedBy.value', ''), timestamp: ''}) }
                <Moment format="LLL" locale={locale}>{_.get(node, 'lastModified.value', '')}</Moment>
            </React.Fragment>
        );
    }

    getContentClass(classes) {
        return classes.modified;
    }
}

class PublicationStatusMarkedForDeletion {
    geti18nDetailsMessage(node, t, locale = 'en') {
        let parentDeletionUser = _.get(_.head(node.ancestors), 'deletionUser.value', '');
        let parentDeletionDate = _.get(_.head(node.ancestors), 'deletionDate.value', '');

        return (
            <React.Fragment>
                { t('label.contentManager.publicationStatus.markedForDeletion', {userName: _.get(node, 'deletedBy.value', parentDeletionUser), timestamp: ''}) }
                <Moment format="LLL" locale={locale}>{ _.get(node, 'deleted.value', parentDeletionDate)}</Moment>
            </React.Fragment>
        );
    }

    getContentClass(classes) {
        return classes.markedForDeletion;
    }
}

class PublicationStatusMandatoryLanguageUnpublishable {
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
        return this[node.aggregatedPublicationInfo.publicationStatus] || this.UNKNOWN;
    }
};
