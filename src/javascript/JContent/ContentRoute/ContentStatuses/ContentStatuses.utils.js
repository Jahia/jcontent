import dayjs from 'dayjs';

import {getDefaultLocale} from '~/JContent/JContent.utils';
import JContentConstants from '~/JContent/JContent.constants';

function formatDate(date, locale = 'en', format = 'LLL') {
    return dayjs(date).locale(locale).format(format);
}

const tooltips = {
    locked: node => {
        return {
            key: 'label.contentManager.lockedBy',
            args: {
                userName: node?.lockOwner?.value || '?'
            }
        };
    },
    markedForDeletion: (node, locale) => {
        const ancestor = node.ancestors && (node.ancestors.length !== 0) && node.ancestors[0];
        const deletedBy = node?.deletedBy?.value || ancestor?.deletedBy?.value;
        const date = node?.deleted?.value || ancestor?.deleted?.value;
        return {
            key: 'label.contentManager.publicationStatus.markedForDeletion',
            args: {
                userName: deletedBy || '?',
                timestamp: formatDate(date, locale)
            }
        };
    },
    modified: (node, locale) => {
        return {
            key: 'label.contentManager.publicationStatus.modified',
            args: {
                userName: node?.lastModifiedBy?.value || '?',
                timestamp: formatDate(node?.lastModified?.value, locale)
            }
        };
    },
    new: () => {
        return {
            key: 'label.contentManager.publicationStatus.notPublished'
        };
    },
    published: (node, locale) => {
        return {
            key: 'label.contentManager.publicationStatus.published',
            args: {
                userName: node?.lastPublishedBy?.value || '?',
                timestamp: formatDate(node?.lastPublished?.value, locale)
            }
        };
    },
    warning: node => {
        const resolveKey = status => {
            switch (status) {
                case JContentConstants.availablePublicationStatuses.CONFLICT:
                    return 'label.contentManager.publicationStatus.conflict.description';
                case JContentConstants.availablePublicationStatuses.MANDATORY_LANGUAGE_VALID:
                    return 'label.contentManager.publicationStatus.mandatoryLanguageValid.description';
                case JContentConstants.availablePublicationStatuses.MANDATORY_LANGUAGE_UNPUBLISHABLE:
                    return 'label.contentManager.publicationStatus.mandatoryLanguageUnpublishable.description';
                default:
                    return 'label.contentManager.publicationStatus.unknown';
            }
        };

        return {
            key: resolveKey(node?.aggregatedPublicationInfo?.publicationStatus)
        };
    },
    workInProgress: node => {
        const tooltip = {
            key: 'label.contentManager.workInProgressAll'
        };

        const wipLangs = node?.wipLangs?.values;
        if (wipLangs) {
            tooltip.key = 'label.contentManager.workInProgress';
            tooltip.args = {wipLangs: wipLangs};
        }

        return tooltip;
    }
};

function getTooltip(node, status, t, lang = 'en') {
    const locale = getDefaultLocale(lang);
    const provider = tooltips[status];

    if (provider) {
        const tooltip = provider(node, locale);
        return t(tooltip.key, tooltip.args);
    }

    return '';
}

export {getTooltip};
