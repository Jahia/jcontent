import {formatDatetime} from 'date-formatter';
import {Constants} from '../../../ContentEditor.constants';

const tooltips = {
    modified: (publicationInfoContext, uilang) => {
        return {
            key: 'label.contentEditor.publicationStatusTooltip.modified',
            args: {
                userName: publicationInfoContext.lastModifiedBy || '?',
                timestamp: formatDatetime(publicationInfoContext.lastModified, {format: 'long', locale: uilang})
            }
        };
    },
    published: (publicationInfoContext, uilang) => {
        return {
            key: 'label.contentEditor.publicationStatusTooltip.published',
            args: {
                userName: publicationInfoContext.lastPublishedBy || '?',
                timestamp: formatDatetime(publicationInfoContext.lastPublished, {format: 'long', locale: uilang})
            }
        };
    },
    warning: publicationInfoContext => {
        const resolveKey = status => {
            switch (status) {
                case Constants.editPanel.publicationStatus.CONFLICT:
                    return 'label.contentEditor.publicationStatusTooltip.conflict';
                case Constants.editPanel.publicationStatus.MANDATORY_LANGUAGE_VALID:
                    return 'label.contentEditor.publicationStatusTooltip.mandatoryLanguageValid';
                case Constants.editPanel.publicationStatus.MANDATORY_LANGUAGE_UNPUBLISHABLE:
                    return 'label.contentEditor.publicationStatusTooltip.mandatoryLanguageUnpublishable';
                default:
                    return 'label.contentEditor.publicationStatusTooltip.unknown';
            }
        };

        return {
            key: resolveKey(publicationInfoContext.publicationStatus)
        };
    }
};

function getTooltip(type, publicationInfoContext, uilang, t) {
    const provider = tooltips[type];

    if (provider) {
        const tooltip = provider(publicationInfoContext, uilang);
        return t(tooltip.key, tooltip.args);
    }

    return '';
}

export {getTooltip};
