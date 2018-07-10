class PublicationStatusNotPublished {

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

class PublicationStatusUnpublished {

    //TODO not sure about username and timestap correctness in this case.

    getDetailsMessage(node, t) {
        return t("label.contentManager.publicationStatus.unpublished", {userName: node.lastPublishedBy, timestamp: node.lastPublished});
    }

    getContentClass(classes) {
        return classes.unpublished;
    }

    getDetailsClass(classes) {
        return classes.publicationStatusUnpublished;
    }
}

export { PublicationStatusMarkedForDeletion, PublicationStatusModified, PublicationStatusNotPublished, PublicationStatusPublished, PublicationStatusUnpublished }