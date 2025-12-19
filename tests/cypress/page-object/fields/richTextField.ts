import {BaseComponent, getComponentByRole} from '@jahia/cypress';
import {Picker} from '../picker';
import {Field} from './field';

export class RichTextField extends Field {
    /**
     * Clears the content of the rich text field.
     */
    clear(index?: number): Cypress.Chainable<JQuery> {
        return this.get().iframe(`${this.getFieldSelector(index)} .cke_wysiwyg_frame`).clear();
    }

    type(text: string, index?: number) {
        this.get().iframe(`${this.getFieldSelector(index)} .cke_wysiwyg_frame`).type(text);
    }

    setData(value: string, index?: number) {
        return this.getEditor(index).then(editor => editor.setData(value));
    }

    getData(index?: number): Cypress.Chainable<string> {
        return this.getEditor(index).then(editor => editor.getData());
    }

    getElement(index?: number): Cypress.Chainable<JQuery> {
        return this.getEditor(index).then(instanceOfCK => {
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

    getFieldSelector(index?: number) {
        return (typeof index === 'number') ? `[data-sel-content-editor-multiple-generic-field="${this.fieldName}[${index}]"]` : '';
    }

    getField(index: number) {
        return this.get().get(this.getFieldSelector(index));
    }

    getEditor(index?: number) {
        return this.get().find(`${this.getFieldSelector(index)} div[id^="cke_editor"]`).invoke('attr', 'id').then(id => {
            const editorId = id.replace('cke_', '');
            return cy.window().its('CKEDITOR').its('instances').its(editorId);
        });
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
        return this.getURLField().invoke('val');
    }

    getURLField(): Cypress.Chainable<JQuery> {
        return this.get().find('div.cke_dialog_ui_text').contains('URL').parent().find('input.cke_dialog_ui_input_text');
    }

    cancel() {
        this.get().find('span.cke_dialog_ui_button').contains('Cancel').click();
    }

    ok() {
        this.get().find('span.cke_dialog_ui_button').contains('OK').click();
    }
}
