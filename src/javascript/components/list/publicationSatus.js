class PublicationStatusNotPublished {

    constructor() {
    }

    getDetailsMessage(node, t) {
        return t("label.contentManager.publicationStatus.notPublished");
    }

    getContentClass(classes) {
        return classes.notPublished;
    }

    getDetailsClass(classes) {
        return classes.publicationStatusNotPublished;
    }
}

class PublicationStatusPublished {

    constructor() {
    }

    getDetailsMessage(node, t) {
        return t("label.contentManager.publicationStatus.published", {userName: node.lastPublishedBy, timestamp: node.lastPublished});
    }

    getContentClass(classes) {
        return classes.published;
    }

    getDetailsClass(classes) {
        return classes.publicationStatusPublished;
    }
}

class PublicationStatusModified {

    constructor() {
    }

    getDetailsMessage(node, t) {
        return t("label.contentManager.publicationStatus.modified", {userName: node.lastModifiedBy, timestamp: node.lastModified});
    }

    getContentClass(classes) {
        return classes.modified;
    }

    getDetailsClass(classes) {
        return classes.publicationStatusModified;
    }
}

class PublicationStatusMarkedForDeletion {

    constructor() {
    }

    getDetailsMessage(node, t) {
        return t("label.contentManager.publicationStatus.markedForDeletion", {userName: node.deletedBy, timestamp: node.deleted});
    }

    getContentClass(classes) {
        return classes.markedForDeletion;
    }

    getDetailsClass(classes) {
        return classes.publicationStatusMarkedForDeletion;
    }
}

export { PublicationStatusMarkedForDeletion, PublicationStatusModified, PublicationStatusNotPublished, PublicationStatusPublished }