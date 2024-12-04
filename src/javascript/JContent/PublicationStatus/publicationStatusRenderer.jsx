import React from 'react';
import dayjs from 'dayjs';
import {Tooltip} from '@material-ui/core';
import {getDefaultLocale, isMarkedForDeletion} from '~/JContent/JContent.utils';
import {CloudCheck, Delete, File, Information, NoCloud} from '@jahia/moonstone';

function getFormattedDate(date, locale) {
    return dayjs(date).locale(getDefaultLocale(locale)).format('LLL');
}

class PublicationStatusUnpublished {
    geti18nDetailsMessage(node, t) {
        return (
            <>
                { t('jcontent:label.contentManager.publicationStatus.unPublished') }
            </>
        );
    }

    getContentClass(classes) {
        return classes.unPublished;
    }

    getBodyClass(classes) {
        return classes.unPublishedBody;
    }

    getIcon(props) {
        return <NoCloud {...props}/>;
    }
}

class PublicationStatusNotPublished {
    geti18nDetailsMessage(node, t) {
        return t('jcontent:label.contentManager.publicationStatus.notPublished');
    }

    getContentClass(classes) {
        return classes.notPublished;
    }

    getBodyClass(classes) {
        return classes.notPublishedBody;
    }

    getIcon(props) {
        return <NoCloud {...props}/>;
    }
}

class PublicationStatusPublished {
    geti18nDetailsMessage(node, t, locale = 'en') {
        const userName = node?.lastPublishedBy?.value || '';
        const lastPublished = node?.lastPublished?.value || '';

        return (
            <>
                { t('jcontent:label.contentManager.publicationStatus.published', {userName, timestamp: ''}) }
                <time>{getFormattedDate(lastPublished, locale)}</time>
            </>
        );
    }

    getContentClass(classes) {
        return classes.published;
    }

    getBodyClass(classes) {
        return classes.publishedBody;
    }

    getIcon(props) {
        return <CloudCheck {...props}/>;
    }
}

class PublicationStatusModified {
    geti18nDetailsMessage(node, t, locale = 'en') {
        const userName = node?.lastModifiedBy?.value || '';
        const lastModified = node?.lastModified?.value || '';

        return (
            <>
                { t('jcontent:label.contentManager.publicationStatus.modified', {userName, timestamp: ''}) }
                <time>{getFormattedDate(lastModified, locale)}</time>
            </>
        );
    }

    getContentClass(classes) {
        return classes.modified;
    }

    getBodyClass(classes) {
        return classes.modifiedBody;
    }

    getIcon(props) {
        return <File {...props}/>;
    }
}

class PublicationStatusMarkedForDeletion {
    geti18nDetailsMessage(node, t, locale = 'en') {
        let parentDeletionUser = (node.ancestors && node.ancestors[0]?.deletionUser?.value) || '';
        let parentDeletionDate = (node.ancestors && node.ancestors[0]?.deletionDate?.value) || '';

        let userName = node?.deletedBy?.value || parentDeletionUser;
        let deletedTs = node?.deleted?.value || parentDeletionDate;

        return (
            <>
                { t('jcontent:label.contentManager.publicationStatus.markedForDeletion', {userName, timestamp: ''}) }
                <time>{getFormattedDate(deletedTs, locale)}</time>
            </>
        );
    }

    getContentClass(classes) {
        return classes.markedForDeletion;
    }

    getBodyClass(classes) {
        return classes.markedForDeletionBody;
    }

    getIcon(props) {
        return <Delete {...props}/>;
    }
}

class PublicationStatusMandatoryLanguageUnpublishable {
    geti18nDetailsMessage(node, t) {
        return (
            <Tooltip title={t('jcontent:label.contentManager.publicationStatus.mandatoryLanguageUnpublishable.description')}>
                <span>
                    {t('jcontent:label.contentManager.publicationStatus.mandatoryLanguageUnpublishable.label')}
                </span>
            </Tooltip>
        );
    }

    getContentClass(classes) {
        return classes.mandatoryLanguageUnpublishable;
    }

    getBodyClass(classes) {
        return classes.mandatoryLanguageUnpublishable;
    }

    getIcon(props) {
        return <Information {...props}/>;
    }
}

class PublicationStatusMandatoryLanguageValid {
    geti18nDetailsMessage(node, t) {
        return (
            <Tooltip title={t('jcontent:label.contentManager.publicationStatus.mandatoryLanguageValid.description')}>
                <span>
                    {t('jcontent:label.contentManager.publicationStatus.mandatoryLanguageValid.label')}
                </span>
            </Tooltip>
        );
    }

    getContentClass(classes) {
        return classes.mandatoryLanguageValid;
    }

    getBodyClass(classes) {
        return classes.mandatoryLanguageValid;
    }

    getIcon(props) {
        return <Information {...props}/>;
    }
}

class PublicationStatusConflict {
    geti18nDetailsMessage(node, t) {
        return (
            <Tooltip title={t('jcontent:label.contentManager.publicationStatus.conflict.description')}>
                <span>
                    {t('jcontent:label.contentManager.publicationStatus.conflict.label')}
                </span>
            </Tooltip>
        );
    }

    getContentClass(classes) {
        return classes.conflict;
    }

    getBodyClass(classes) {
        return classes.conflict;
    }

    getIcon(props) {
        return <Information {...props}/>;
    }
}

class PublicationStatusUnknown {
    geti18nDetailsMessage(node, t) {
        return t('jcontent:label.contentManager.publicationStatus.unknown');
    }

    getContentClass(classes) {
        return classes.unknown;
    }

    getBodyClass(classes) {
        return classes.unknown;
    }

    getIcon(props) {
        return <Information {...props}/>;
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
