// Migrated from the legacy Selenium class ContentManagerTest (Jahia/selenium#1650), FT-020 to FT-026.
//
// Each FT edits its own copy of the image: a confirmed save rewrites the file in place, so a shared
// image would carry the size one FT saved into the next one.

import {addNode, context, createSite, createUser, deleteUser, grantRoles, uploadFile} from '@jahia/cypress';
import {JContent} from '../../../page-object';

const siteKey = 'contentManagerImageEditor';
const folder = 'image-editor';
const folderPath = `/sites/${siteKey}/files/${folder}`;
const editor = {username: 'cmImageEditorChief', password: 'password'};
const fixture = 'contentEditor/contentMultiLanguage/snowBear.jpeg';
const images = {
    open: 'open.jpeg',
    rotate: 'rotate.jpeg',
    resizeRatio: 'resize-ratio.jpeg',
    resizeFree: 'resize-free.jpeg',
    cropDimensions: 'crop-dimensions.jpeg',
    cropSelection: 'crop-selection.jpeg',
    cropSaveAs: 'crop-save-as.jpeg'
};
const identity = 'matrix(1, 0, 0, 1, 0, 0)';

let original: {width: number; height: number};

const removeFixtures = () => {
    cy.executeGroovy('jcontent/deleteSite.groovy', {SITEKEY: siteKey});
    deleteUser(editor.username);
};

const filePath = (name: string) => `/files/default${folderPath}/${name}`;

// The editor reads the size of the image once it has loaded it, and stays at 1 x 1 until then.
const waitForImageSize = (width: number, height: number) => {
    cy.get(`[data-image-original-width="${width}"][data-image-original-height="${height}"]`).should('exist');
};

const openImageEditor = (name: string): JContent => {
    cy.login(editor.username, editor.password);
    const jcontent = JContent.visit(siteKey, 'en', `media/files/${folder}`);
    jcontent.switchToThumbnails();
    jcontent.getGrid().getCardByName(name).contextMenu().selectByRole('editImage');
    cy.get('[data-cm-role="rotate-panel"]').should('be.visible');
    return jcontent;
};

const setCropWidth = (width: number) => {
    cy.get('#width-field').clear();
    cy.get('#width-field').type(String(width));
    cy.get('#width-field').should('have.value', String(width));
};

describe('Image editor', () => {
    before(() => {
        removeFixtures();

        createSite(siteKey, {templateSet: 'dx-base-demo-templates', serverName: 'localhost', locale: 'en'});
        createUser(editor.username, editor.password);
        grantRoles(`/sites/${siteKey}`, ['editor-in-chief'], editor.username, 'USER');

        addNode({parentPathOrId: `/sites/${siteKey}/files`, name: folder, primaryNodeType: 'jnt:folder'});
        Object.values(images).forEach(name => uploadFile(fixture, folderPath, name, 'image/jpeg'));

        // Jahia extracts the size of an uploaded image into j:width and j:height
        cy.apollo({
            queryFile: 'jcontent/imageEditor/getImageDimensions.graphql',
            variables: {path: `${folderPath}/${images.open}`}
        }).then(({data}) => {
            const node = data.jcr.nodeByPath;
            original = {width: Number(node.width.value), height: Number(node.height.value)};
            expect(original.width).to.be.greaterThan(500);
        });
    });

    after(() => {
        cy.logout();
        removeFixtures();
    });

    it('FT-020: The image editor opens on the selected image', () => {
        context.tag('jcontent', 'image-editor', 'open-editor');

        openImageEditor(images.open);

        cy.get('img[data-cm-role="preview-image"]')
            .should('be.visible')
            .and('have.attr', 'src')
            .and('contain', filePath(images.open));
    });

    it('FT-021: Rotation changes the preview and undo restores it', () => {
        context.tag('jcontent', 'image-editor', 'rotate-undo');
        openImageEditor(images.rotate);
        waitForImageSize(original.width, original.height);
        cy.get('img[data-cm-role="preview-image"]').should('have.css', 'transform', identity);

        cy.get('[data-cm-role="rotate-left"]').click();
        cy.get('img[data-cm-role="preview-image"]').should('not.have.css', 'transform', identity);
        cy.get('[data-cm-role="rotate-left"]').click();
        cy.get('[data-cm-role="image-save-button"]').click();
        cy.get('[data-cm-role="image-save-no"]').click();
        cy.get('[data-cm-role="undo-changes"]').click();

        cy.get('img[data-cm-role="preview-image"]').should('have.css', 'transform', identity);
    });

    it('FT-022: Resize keeps the ratio by default', () => {
        context.tag('jcontent', 'image-editor', 'resize-ratio');
        openImageEditor(images.resizeRatio);
        waitForImageSize(original.width, original.height);
        cy.get('[data-cm-role="resize-panel"]').click();
        cy.get('#width-field').should('have.value', String(original.width));

        cy.get('#width-field').focus();
        cy.realPress('ArrowDown');

        const width = original.width - 1;
        const height = Math.round(width * original.height / original.width);
        cy.get('#width-field').should('have.value', String(width));
        cy.get('#height-field').should('have.value', String(height));
        cy.get('[data-cm-role="image-save-button"]').click();
        cy.get('[data-cm-role="image-save-yes"]').click();
        // The editor reloads the saved file, so its new size proves the save went through
        waitForImageSize(width, height);
    });

    it('FT-023: Resize with the ratio unlocked keeps the height', () => {
        context.tag('jcontent', 'image-editor', 'resize-free');
        openImageEditor(images.resizeFree);
        waitForImageSize(original.width, original.height);
        cy.get('[data-cm-role="resize-panel"]').click();
        cy.get('#width-field').should('have.value', String(original.width));
        cy.get('[data-cm-role="keep-ratio-button"]').click();

        cy.get('#width-field').focus();
        cy.realPress('ArrowDown');

        const width = original.width - 1;
        cy.get('#width-field').should('have.value', String(width));
        cy.get('#height-field').should('have.value', String(original.height));
        cy.get('[data-cm-role="image-save-button"]').click();
        cy.get('[data-cm-role="image-save-yes"]').click();
        waitForImageSize(width, original.height);
    });

    it('FT-024: The crop panel shows the original dimensions', () => {
        context.tag('jcontent', 'image-editor', 'crop-dimensions');
        openImageEditor(images.cropDimensions);

        cy.get('[data-cm-role="crop-panel"]').click();

        // The crop selection covers the whole image, so Cypress reports the image itself as hidden
        cy.get('img.ReactCrop__image')
            .should($img => expect(($img[0] as HTMLImageElement).naturalWidth).to.equal(original.width))
            .and('have.attr', 'src')
            .and('contain', filePath(images.cropDimensions));
        waitForImageSize(original.width, original.height);
    });

    it('FT-025: Changing the crop width draws a crop selection', () => {
        context.tag('jcontent', 'image-editor', 'crop-selection');
        openImageEditor(images.cropSelection);
        waitForImageSize(original.width, original.height);
        cy.get('[data-cm-role="crop-panel"]').click();

        setCropWidth(500);
        // The selection is percent-based and starts over the whole image, so its width is the proof
        cy.get('.ReactCrop__crop-selection')
            .should('be.visible')
            .and($selection => expect(Number.parseFloat($selection[0].style.width)).to.be.closeTo(500 * 100 / original.width, 0.01));
        cy.get('[data-cm-role="image-save-button"]').click();
        cy.get('[data-cm-role="image-save-no"]').click();
        cy.get('[data-cm-role="undo-changes"]').click();

        cy.get('#width-field').should('have.value', String(original.width));
        cy.get('.ReactCrop__crop-selection').should('be.visible');
    });

    it('FT-026: Save as creates a cropped copy', () => {
        context.tag('jcontent', 'image-editor', 'crop-save-as');
        const jcontent = openImageEditor(images.cropSaveAs);
        waitForImageSize(original.width, original.height);
        cy.get('[data-cm-role="crop-panel"]').click();
        setCropWidth(500);

        cy.get('[data-cm-role="image-save-as-button"]').click();
        cy.get('[data-cm-role="image-save-as-confirm"]').click();

        const copyName = images.cropSaveAs.replace(/\.jpeg$/, '.copy.jpeg');
        const height = Math.round(500 * original.height / original.width);
        // After a save as, the editor switches to the copy it created
        cy.get('[role="dialog"]').contains(copyName).should('be.visible');
        waitForImageSize(500, height);
        cy.get('[data-sel-role="cancel-button"]').click();
        jcontent.getGrid().getCardByName(copyName);
    });
});
