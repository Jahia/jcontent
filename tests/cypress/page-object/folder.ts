import {
    BasePage,
    getComponentByRole,
    Menu
} from '@jahia/cypress';
import {JContent} from './jcontent';
import {Media} from './media';

export class Folder extends BasePage {
    media: Media;
    name : string;
    parentPath : string;
    jcontent : JContent;

    constructor(media: Media, parentPath : string, name : string) {
        super();
        this.media = media;
        this.name = name;
        this.parentPath = parentPath;
        this.jcontent = new JContent();
    }

    visitFolder() : Folder {
        JContent.visit('jcontentSite', 'en', this.parentPath + '/' + encodeURIComponent(this.name));
        return this;
    }

    visitParent() : Folder {
        JContent.visit('jcontentSite', 'en', this.parentPath);
        return this;
    }

    markForDeletion() : Folder {
        this.jcontent.getGrid().getCardByName(this.name).contextMenu().selectByRole('delete');
        cy.get('[data-sel-role="delete-mark-button"]').click();
        // Verify dialog has been dismissed before proceeding
        cy.get('[data-sel-role="delete-mark-dialog"]').should('not.exist');
        return this;
    }

    // Delete the folder we just created permanently
    deletePermanently() : Folder {
        this.jcontent.getGrid().getCardByName(this.name).contextMenu().selectByRole('deletePermanently');
        cy.get('[data-sel-role="delete-permanently-button"]').click();
        return this;
    }
}

