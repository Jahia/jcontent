import {
    BasePage,
    Button,
    getComponentByAttr,
    getComponentByRole,
    getElement
} from '@jahia/cypress';
import {JContent} from './jcontent';
import {Folder} from './folder';
import {File} from './file';

export class Media extends BasePage {
    jcontent: JContent;

    constructor(jcontent: JContent) {
        super();
        this.jcontent = jcontent;
    }

    open(): Media {
        this.jcontent.selectAccordion('media');
        return this;
    }

    createFolder(parentPath: string, folderName: string): Folder {
        getComponentByRole(Button, 'createFolder').click();
        getElement('input#folder-name').type(folderName);
        getComponentByAttr(Button, 'data-cm-role', 'create-folder-as-confirm').click();
        return new Folder(this, parentPath, folderName);
    }

    createInvalidFolder(parentPath: string, folderName: string): Media {
        getComponentByRole(Button, 'createFolder').click();
        getElement('input#folder-name').type(folderName);
        cy.get('#folder-name-helper-text').should('contain', 'Invalid characters');
        getComponentByAttr(Button, 'data-cm-role', 'create-folder-as-cancel').click();
        return this;
    }

    createFile(fileName: string): File {
        return new File(this, fileName);
    }

    uploadFileViaDragAndDrop(fileName: string, fixtureSubFolder: string): File {
        cy.get('div[data-sel-role-card=bootstrap]').parent().selectFile(`cypress/fixtures/${fixtureSubFolder}/${fileName}`, {action: 'drag-drop'});
        this.waitForUploadToComplete();
        return new File(this, fileName);
    }

    uploadFileViaDialog(fileName: string, fixtureSubFolder = '.'): File {
        cy.get('button[data-sel-role="fileUpload"]').should('be.visible').click();
        cy.get('input#file-upload-input[type="file"]').selectFile(`cypress/fixtures/${fixtureSubFolder}/${fileName}`, {force: true});
        this.waitForUploadToComplete();
        return new File(this, fileName);
    }

    private waitForUploadToComplete(): void {
        cy.get('[data-cm-role="upload-status-success"]').should('be.visible');
        cy.get('[data-cm-role="upload-close-button"]').click();
        cy.get('[data-cm-role="upload-status-success"]').should('not.be.visible');
    }

    switchView(displayMode: 'list' | 'grid') {
        cy.get('div[data-sel-role="sel-view-mode-dropdown"]').click();
        cy.get('li[data-sel-role="sel-view-mode-' + displayMode + '"]').click();
        return this;
    }

    switchSortDirection(direction: 'asc' | 'desc') {
        cy.get('button[data-sel-role="sel-media-sort-dropdown"]').click();
        cy.get('div[data-sel-role="sel-media-sort-order-dropdown"]')
            .click();
        cy.get('div[data-sel-role="sel-media-sort-order-dropdown"]')
            .find(`li[data-sel-role="sel-media-sort-order-${direction}"]`)
            .click();
        cy.get('div[class="moonstone-menu_overlay"]').click();
        return this;
    }

    switchSortProperty(property: 'name' | 'type' | 'size' | 'lastModified') {
        cy.get('button[data-sel-role="sel-media-sort-dropdown"]').click();
        cy.get('div[data-sel-role="sel-media-sort-property-dropdown"]')
            .click();
        cy.get('div[data-sel-role="sel-media-sort-property-dropdown"]')
            .find(`li[data-sel-role="sel-media-sort-property-${property}"]`)
            .click();
        cy.get('div[class="moonstone-menu_overlay"]').click();
        return this;
    }
}

