import JContentConstants from '~/JContent/JContent.constants';

export function setPublicationStatus(statuses, publicationStatus, existsInLive) {
    if (!publicationStatus) {
        return;
    }

    const {
        MODIFIED,
        NOT_PUBLISHED,
        PUBLISHED,
        UNPUBLISHED,
        MARKED_FOR_DELETION
    } = JContentConstants.availablePublicationStatuses;

    switch (publicationStatus) {
        case MODIFIED:
            statuses.modified = true;
            statuses.published = true;
            break;
        case PUBLISHED:
            statuses.published = true;
            break;
        case NOT_PUBLISHED:
        case UNPUBLISHED:
            statuses.published = false;
            break;
        case MARKED_FOR_DELETION:
            // We look at existsInLive property to determine if the content is published or not
            // since publicationStatus is masked by the MARKED_FOR_DELETION status when content is published
            statuses.published = existsInLive;
            break;
        default:
            statuses.warning = true;
    }

    statuses.notPublished = !statuses.published;
}
