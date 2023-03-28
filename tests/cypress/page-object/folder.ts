import {
    BasePage,
    getComponentByRole,
    Menu
} from '@jahia/cypress';
import {JContent} from './jcontent';
import {Media} from './media';

export class Folder extends BasePage {
    media: Media
    name : string
    parentPath : string

    constructor(media: Media, parentPath : string, name : string) {
        super();
        this.media = media;
        this.name = name;
        this.parentPath = parentPath;
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
        cy.get('div[data-sel-role-card=' + this.name + ']').should('be.visible').trigger('mouseover').rightclick();
        getComponentByRole(Menu, 'jcontent-contentMenu').selectByRole('delete');
        cy.get('[data-sel-role="delete-mark-button"]').click();
        return this;
    }

    deletePermanently() : Folder {
        // Delete the folder we just created permanently
        cy.get('div[data-sel-role-card=' + this.name + ']').should('be.visible').trigger('mouseover').rightclick();
        getComponentByRole(Menu, 'jcontent-contentMenu').selectByRole('deletePermanently');
        cy.get('[data-sel-role="delete-permanently-button"]').click();
        return this;
    }
}

