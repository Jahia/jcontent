import {JContent} from '../../page-object';

describe('Picker tests - richtext', () => {
    const siteKey = 'digitall';
    let jcontent: JContent;

    beforeEach(() => {
        cy.login();
        cy.apollo({mutationFile: 'contentEditor/pickers/createContent.graphql'});
        jcontent = JContent.visit(siteKey, 'en', 'content-folders/contents/ce-picker-contents');
    });

    afterEach(() => {
        cy.apollo({mutationFile: 'contentEditor/pickers/deleteContent.graphql'});
        cy.logout();
    });

    it('Content picker in richtext', () => {
        const contentEditor = jcontent.createContent('Rich text');
        const richText = contentEditor.getRichTextField('jnt:bigText_text');

        richText.type('Hello');

        const linkModal = richText.openLinkModal();
        const picker = linkModal.openBrowseServerContents();
        picker.getTable().get().contains('Home').click();
        picker.select();
        linkModal.ok();

        richText.getData().should('have.string', 'home');
    });

    it('File picker in richtext', () => {
        const contentEditor = jcontent.createContent('Rich text');
        const richText = contentEditor.getRichTextField('jnt:bigText_text');

        richText.type('Hello');

        const linkModal = richText.openLinkModal();
        // Test to make sure parsing of existing URLs do not break picker
        linkModal.getURLField().type('https://www.interregemr.eu/projets/marhetak-fr');
        const picker = linkModal.openBrowseServerFiles();
        picker.getTable().get().contains('images').dblclick();
        picker.getTable().get().contains('banners').dblclick();
        picker.getTable().get().contains('editing-digitall-site').click();
        picker.select();
        linkModal.ok();

        richText.getData().should('have.string', 'editing-digitall-site');
    });

    it('Image picker in richtext handles special characters properly', () => {
        // Create a content with a special character in the name
        cy.fixture('assets/üöäè e`!.png', 'binary')
            .then(image => {
                // Convert the file base64 string to a blob
                const blob = Cypress.Blob.binaryStringToBlob(image, 'image/png');
                const file = new File([blob], 'üöäè e`!.png', {type: blob.type});
                cy.apollo({
                    mutationFile: 'contentEditor/pickers/uploadFile.graphql',
                    variables: {
                        path: `/sites/${siteKey}/files/ce-picker-files`,
                        name: 'üöäè e`!.png',
                        mimeType: 'image/png',
                        file: file
                    }
                });
                // eslint-disable-next-line cypress/no-unnecessary-waiting
                cy.wait(1000);
            });
        const contentEditor = jcontent.createContent('Rich text');
        const richText = contentEditor.getRichTextField('jnt:bigText_text');

        richText.type('Hello');

        const imageModal = richText.openImageModal();
        const picker = imageModal.openBrowseServerImages();
        picker.getGrid().get().contains('ce-picker-files').dblclick();
        picker.getGrid().get().contains('üöäè e`!.png').click();
        picker.select();
        imageModal.ok();

        richText.getData().should('have.string', 'üöäè e`!.png');
        contentEditor.create();

        const rowByLabel = jcontent.getTable().getRowByLabel('Hello');
        rowByLabel.contextMenu().select('Edit');
        const richText2 = contentEditor.getRichTextField('jnt:bigText_text');
        richText2.getData().should('have.string', 'üöäè e`!.png');
        richText2.getElement('img').dblclick({force: true});
        richText2.getOpenedImageModal().getURLFieldValue().should('have.string', `/files/{workspace}/sites/digitall/files/ce-picker-files/${encodeURIComponent('üöäè e`!.png').toLowerCase()}`);
    });
});

