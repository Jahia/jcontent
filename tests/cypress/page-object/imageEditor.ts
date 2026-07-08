import {BasePage, Button, getComponentByAttr} from '@jahia/cypress';
import {JContent} from './jcontent';

/**
 * Page object for the Filerobot-based image editor modal (editImage action).
 */
export class ImageEditor extends BasePage {
    /**
     * Opens the image editor on a file shown in the media grid, via the context menu.
     */
    static open(fileName: string): ImageEditor {
        new JContent().getGrid().getCardByName(fileName).contextMenu().selectByRole('editImage');
        return new ImageEditor().waitForLoaded();
    }

    getDialog() {
        return cy.get('[data-cm-role="image-editor-dialog"]');
    }

    /**
     * The editor opens on the Resize tab; its width input is populated with the image
     * width once the image is loaded, which makes it a reliable readiness gate.
     */
    waitForLoaded(): ImageEditor {
        this.getDialog().should('be.visible');
        this.getResizeWidthInput().should('not.have.value', '');
        return this;
    }

    getResizeWidthInput() {
        return this.getDialog().find('.FIE_resize-width-option input');
    }

    getResizeHeightInput() {
        return this.getDialog().find('.FIE_resize-height-option input');
    }

    resizeToWidth(width: number): ImageEditor {
        this.getResizeWidthInput().clear();
        this.getResizeWidthInput().type(String(width)).blur();
        return this;
    }

    save(): void {
        getComponentByAttr(Button, 'data-cm-role', 'image-save-button').click();
        this.getDialog().should('not.exist');
    }

    saveAs(newName: string): void {
        getComponentByAttr(Button, 'data-cm-role', 'image-save-as-button').click();
        cy.get('input[data-cm-role="image-save-as-name"]').clear();
        cy.get('input[data-cm-role="image-save-as-name"]').type(newName);
        getComponentByAttr(Button, 'data-cm-role', 'image-save-as-confirm').click();
        this.getDialog().should('not.exist');
    }

    cancel(): void {
        getComponentByAttr(Button, 'data-cm-role', 'image-editor-cancel').click();
        this.getDialog().should('not.exist');
    }
}
