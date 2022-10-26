import {
    BasePage,
    getComponentByRole,
    Menu,
} from '@jahia/cypress'
import { JContent } from './jcontent'
import {Media} from "./media";

export class Folder extends BasePage {
    media: Media
    name : string
    parentPath : string

    constructor(media: Media, parentPath : string, name : string) {
        super()
        this.media = media;
        this.name = name;
        this.parentPath = parentPath
    }

    visitFolder() : Folder {
        JContent.visit('jcontentSite', 'en', this.parentPath + '/' + encodeURIComponent(this.name));
        return this;
    }

    visitParent() {
        JContent.visit('jcontentSite', 'en', this.parentPath);
        return this;
    }

    markForDeletion() : Folder {
        cy.get('div[data-sel-role-card='+this.name+']').should('be.visible').trigger('mouseover').rightclick();
        getComponentByRole(Menu, 'jcontent-contentMenu').selectByRole('delete');
        cy.get("textarea.x-form-textarea").type('Deleting '+this.name+' folder automatically');
        cy.contains('.x-btn-text', 'Yes').click()
        return this;
    }

    deletePermanently() : Folder {
        // Delete the folder we just created permanently
        cy.get('div[data-sel-role-card='+this.name+']').should('be.visible').trigger('mouseover').rightclick();
        getComponentByRole(Menu, 'jcontent-contentMenu').selectByRole('deletePermanently');
        cy.contains('.x-btn-text', 'Yes').click()
        cy.get('div[data-sel-role-card='+this.name+']').should('not.exist');
        return this;
    }

}

