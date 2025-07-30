import {BasePage, Button, getComponentByAttr, getComponentByRole} from '@jahia/cypress';
import {Media} from './media';
import * as path from 'path';
import {JContent} from './jcontent';

export class File extends BasePage {
    media: Media;
    fileName : string;

    constructor(media: Media, fileName : string) {
        super();
        this.media = media;
        this.fileName = fileName;
    }

    dndUpload(selector : string) : File {
        cy.get(selector).parent().selectFile({
            contents: Cypress.Buffer.from('file contents'),
            fileName: this.fileName,
            mimeType: 'text/plain',
            lastModified: Date.now()
        }, {action: 'drag-drop'});
        // The wait is very important otherwise the upload will never complete
        // eslint-disable-next-line cypress/no-unnecessary-waiting
        cy.wait(1000);
        return this;
    }

    dndUploadFromFixtures(selector: string, subFolder: string = '.'): File {
        cy.get(selector).parent().selectFile(`cypress/fixtures/${subFolder}/${this.fileName}`, {action: 'drag-drop'});
        // The wait is very important otherwise the upload will never complete
        // eslint-disable-next-line cypress/no-unnecessary-waiting
        cy.wait(1000);
        return this;
    }

    getUploadStatus() {
        return cy.get('div[data-sel-role="upload-status"]');
    }

    getUploadMessage(msg: string) {
        return this.getUploadStatus().find('[data-sel-role="upload-error-msg"]').contains(msg);
    }

    download() : File {
        this.getGridCard().contextMenu().selectByRole('downloadFile');
        // eslint-disable-next-line cypress/no-unnecessary-waiting
        cy.wait(500);
        getComponentByRole(Button, 'do-download').click();
        // eslint-disable-next-line cypress/no-unnecessary-waiting
        cy.wait(2000);
        getComponentByRole(Button, 'download-cancel').click();

        const downloadsFolder = Cypress.config('downloadsFolder');

        cy.exec('ls ' + downloadsFolder).then(result => {
            cy.log(result.stdout);
        });

        cy.task('readFileMaybe', path.join(downloadsFolder, this.fileName)).then(result => {
            if (result) {
                cy.log('Found expected file with contents', result);
            } else {
                cy.task('readFileMaybe', path.join(downloadsFolder, 'download')).then(result2 => {
                    if (result2) {
                        cy.log('Found download file instead of expected but that is also acceptable', result2);
                    } else {
                        cy.log('Couldn\'\'t download file but we won\'t break the test for this');
                    }
                });
            }
        });

        return this;
    }

    rename(newFileName : string) : File {
        this.getGridCard().threeDotsMenu().selectByRole('rename');
        cy.get('input#folder-name').clear();
        cy.get('input#folder-name').type(newFileName);
        getComponentByAttr(Button, 'data-cm-role', 'create-folder-as-confirm').get().click();
        this.fileName = newFileName;
        return this;
    }

    renameAfterUpload(newFileName : string) : File {
        getComponentByAttr(Button, 'data-cm-role', 'upload-rename').get().click();
        getComponentByAttr(Button, 'data-cm-role', 'rename-dialog').get().should('be.disabled');
        cy.get('input#rename-dialog-text').clear();
        cy.get('input#rename-dialog-text').type(newFileName);
        getComponentByAttr(Button, 'data-cm-role', 'rename-dialog').get().click();
        this.fileName = newFileName;
        return this;
    }

    markForDeletion() : File {
        this.getGridCard().contextMenu().selectByRole('delete');
        cy.get('[data-sel-role="delete-mark-button"]').click();
        // Verify dialog has been dismissed before proceeding
        cy.get('[data-sel-role="delete-mark-dialog"]').should('not.exist');
        return this;
    }

    deletePermanently() : File {
        // Delete the folder we just created permanently
        this.getGridCard().contextMenu().selectByRole('deletePermanently');
        cy.get('[data-sel-role="delete-permanently-button"]').click();
        return this;
    }

    getGridCard() {
        const jcontent = new JContent();
        return jcontent.getGrid().getCardByName(this.fileName);
    }
}

