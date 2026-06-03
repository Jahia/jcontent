import {BasePage, getComponent} from '@jahia/cypress';
import {JContent} from './jcontent';
import {DeleteDialog, DeletePermanentlyDialog} from './deleteDialog';

export class ContentFolder extends BasePage {
    jcontent: JContent;
    name: string;
    parentPath: string;
    site: string;
    language: string;

    constructor(jcontent: JContent, site: string, language: string, parentPath: string, name: string) {
        super();
        this.jcontent = jcontent;
        this.site = site;
        this.language = language;
        this.parentPath = parentPath;
        this.name = name;
    }

    static create(jcontent: JContent, site: string, language: string, parentPath: string, folderName: string): ContentFolder {
        jcontent.getHeaderActionButton('createContentFolder').click();
        cy.get('#folder-name').type(folderName);
        cy.get('[data-cm-role="create-folder-as-confirm"]').click();
        return new ContentFolder(jcontent, site, language, parentPath, folderName);
    }

    markForDeletion(): ContentFolder {
        this.jcontent.getTable().getRowByName(this.name).contextMenu().selectByRole('delete');
        getComponent(DeleteDialog).markForDeletion();
        return this;
    }

    deletePermanently(): ContentFolder {
        this.jcontent.getTable().getRowByName(this.name).contextMenu().selectByRole('deletePermanently');
        getComponent(DeletePermanentlyDialog).delete();
        return this;
    }
}
