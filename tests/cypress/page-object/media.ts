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

    createFolder(parentPath : string, folderName : string) : Folder {
        getComponentByRole(Button, 'createFolder').click();
        getElement('input#folder-name').type(folderName);
        getComponentByAttr(Button, 'data-cm-role', 'create-folder-as-confirm').click();
        return new Folder(this, parentPath, folderName);
    }

    createInvalidFolder(parentPath : string, folderName : string) : Media {
        getComponentByRole(Button, 'createFolder').click();
        getElement('input#folder-name').type(folderName);
        cy.get('#folder-name-helper-text').should('contain', 'Invalid characters');
        getComponentByAttr(Button, 'data-cm-role', 'create-folder-as-cancel').click();
        return this;
    }

    createFile(fileName : string, htmlEscapedFileName? : string, urlEscapedFileName? : string) : File {
        return new File(this, fileName, htmlEscapedFileName, urlEscapedFileName);
    }
}

