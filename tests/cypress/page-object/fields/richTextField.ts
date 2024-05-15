import {BaseComponent, getComponentByRole} from '@jahia/cypress';
import {Picker} from '../picker';
import {Field} from './field';

export class RichTextField extends Field {
    type(text: string) {
        this.get().iframe('.cke_wysiwyg_frame').type(text);
    }

    setData(value: string) {
        cy.window().its('CKEDITOR').its('instances').then(instances => {
            instances[Object.keys(instances)[0]].setData(value);
        });
    }

    getData(): Cypress.Chainable<string> {
        return cy.window().its('CKEDITOR').its('instances').then(instances => instances[Object.keys(instances)[0]].getData());
    }

    getElement(elementName: string): Cypress.Chainable<JQuery> {
        return cy.window().its('CKEDITOR').its('instances').then(instances => {
            const instanceOfCK = instances[Object.keys(instances)[0]];
            instanceOfCK.focus();
            console.log('instanceOfCK', instanceOfCK.editable().findOne('img'));
            return instanceOfCK.editable().findOne('img').$;
        });
    }

    openLinkModal() {
        this.get().find('.cke_button__link_icon').click();
        return new LinkModal(cy.get('.cke_dialog_body'));
    }

    openImageModal() {
        this.get().find('.cke_button__image_icon').click();
        return new LinkModal(cy.get('.cke_dialog_body'));
    }

    getOpenedImageModal() {
        return new LinkModal(cy.get('.cke_dialog_body'));
    }
}

export class LinkModal extends BaseComponent {
    openBrowseServerContents(): Picker {
        this.get().find('span.cke_dialog_ui_button').contains('Browse Server (Content)').click();
        return getComponentByRole(Picker, 'picker-dialog');
    }

    openBrowseServerFiles(): Picker {
        this.get().find('span.cke_dialog_ui_button').contains('Browse Server (Files)').click();
        return getComponentByRole(Picker, 'picker-dialog');
    }

    openBrowseServerImages(): Picker {
        this.get().find('span.cke_dialog_ui_button').contains('Browse Server').click();
        return getComponentByRole(Picker, 'picker-dialog');
    }

    getURLFieldValue(): Cypress.Chainable<string> {
        return this.get().find('div.cke_dialog_ui_text').contains('URL').parent().find('input.cke_dialog_ui_input_text').invoke('val');
    }

    cancel() {
        this.get().find('span.cke_dialog_ui_button').contains('Cancel').click();
    }

    ok() {
        this.get().find('span.cke_dialog_ui_button').contains('OK').click();
    }
}
