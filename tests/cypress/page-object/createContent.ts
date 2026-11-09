import {BaseComponent, BasePage, Button, Dropdown, getComponent, getComponentByRole, getElement, MUIInput} from '@jahia/cypress';
import {JContent} from './jcontent';
import {ContentEditor} from './contentEditor';

export class CreateContent extends BasePage {
    jcontent: JContent;

    constructor(jcontent: JContent) {
        super();
        this.jcontent = jcontent;
    }

    open(): CreateContent {
        getComponentByRole(Button, 'createContent').click();
        return this;
    }

    getContentTypeSelector(): ContentTypeSelector {
        return getComponent(ContentTypeSelector);
    }
}

export class ContentTypeSelector extends BaseComponent {
    static defaultSelector = 'div[aria-labelledby="dialog-createNewContent"]';

    searchInput = getComponentByRole(MUIInput, 'content-type-dialog-input', this);

    searchForContentType(contentType: string): ContentTypeSelector {
        this.searchInput.type(contentType);
        return this;
    }

    selectContentType(contentType: string): ContentTypeSelector {
        getElement(`[data-sel-role="content-type-tree"] li[data-sel-content-type="${contentType}"]`, this).click();
        return this;
    }

    cancel(): void {
        getComponentByRole(Button, 'content-type-dialog-cancel', this).click();
    }

    getSamplePreview(): SamplePreview {
        return getComponent(SamplePreview, this);
    }

    /**
     * Creates the content from the sample on show, as a filled copy, rather than an empty node.
     */
    useSample(): ContentEditor {
        getComponentByRole(Button, 'content-type-dialog-use-sample', this).click();
        return new ContentEditor();
    }

    create(): ContentEditor {
        getComponentByRole(Button, 'content-type-dialog-create', this).click();
        return new ContentEditor();
    }
}

/**
 * The right-hand pane of the content type picker: a rendered example of the selected type.
 */
export class SamplePreview extends BaseComponent {
    static defaultSelector = '[data-sel-role="sample-preview"]';

    getViewportSelector(): Dropdown {
        return getComponentByRole(Dropdown, 'preview-viewport', this);
    }

    getSampleSelector(): Dropdown {
        return getComponentByRole(Dropdown, 'sample-preview-selector', this);
    }

    /**
     * The preview renders in an iframe, so the assertion has to reach into its document rather than
     * look for text in the page.
     */
    shouldRenderContaining(text: string): void {
        this.get()
            .find('iframe[data-sel-role="edit-preview-frame"]')
            .its('0.contentDocument.body')
            .should('be.visible')
            .and('contain.text', text);
    }
}
