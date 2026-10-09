import {JContent, ImageEditor} from '../../page-object';
import {getNodeByPath} from '@jahia/cypress';

describe('Image editor tests', {numTestsKeptInMemory: 1}, () => {
    const siteKey = 'imageEditorSite';
    // Fixture file to upload; the upload sanitizes the node name (lowercased base)
    const fixtureFileName = 'snowbearHome.jpeg';
    const fileName = 'snowbearhome.jpeg';

    let jcontent: JContent;

    // J:width/j:height sit on the file node (jmix:image); jcr:mimeType on its jcr:content child
    const getImageProperties = (nodeName: string) => {
        return getNodeByPath(`/sites/${siteKey}/files/${nodeName}`, ['j:width', 'j:height'])
            .then(res => {
                const properties: {name: string, value: string}[] = res?.data?.jcr?.nodeByPath?.properties || [];
                return properties.reduce((acc, p) => ({...acc, [p.name]: p.value}), {} as Record<string, string>);
            })
            .then(dimensions => {
                return getNodeByPath(`/sites/${siteKey}/files/${nodeName}/jcr:content`, ['jcr:mimeType']).then(res => {
                    const properties: {name: string, value: string}[] = res?.data?.jcr?.nodeByPath?.properties || [];
                    return properties.reduce((acc, p) => ({...acc, [p.name]: p.value}), dimensions);
                });
            });
    };

    before(function () {
        cy.executeGroovy('jcontent/createSite.groovy', {SITEKEY: siteKey});
        cy.loginAndStoreSession();
        JContent.visit(siteKey, 'en', 'media/files');
        new JContent().getMedia().open().uploadFileViaDialog(fixtureFileName, 'contentEditor');
    });

    after(function () {
        cy.logout();
        cy.executeGroovy('jcontent/deleteSite.groovy', {SITEKEY: siteKey});
    });

    beforeEach(function () {
        cy.loginAndStoreSession();
        jcontent = JContent.visit(siteKey, 'en', 'media/files');
        jcontent.getMedia().open();
    });

    it('Opens the editor from the context menu and closes it with Cancel', function () {
        const editor = ImageEditor.open(fileName);
        editor.cancel();
    });

    it('Resizes an image and saves it, preserving the original format', function () {
        const editor = ImageEditor.open(fileName);
        editor.resizeToWidth(400);
        editor.save();

        // The binary is replaced in place; the JCR image listener re-extracts dimensions.
        cy.waitUntil(() => getImageProperties(fileName).then(props => {
            return props['jcr:mimeType'] === 'image/jpeg' && props['j:width'] === '400';
        }), {
            timeout: 20000,
            interval: 1000,
            errorMsg: 'Expected the saved image to stay image/jpeg and have j:width=400'
        });
    });

    it('Saves an edited image as a new file', function () {
        const copyName = 'snowbear-copy.jpeg';
        const editor = ImageEditor.open(fileName);
        editor.resizeToWidth(300);
        editor.saveAs(copyName);

        cy.waitUntil(() => getImageProperties(copyName).then(props => {
            return props['jcr:mimeType'] === 'image/jpeg' && props['j:width'] === '300';
        }), {
            timeout: 20000,
            interval: 1000,
            errorMsg: 'Expected the save-as copy to exist as image/jpeg with j:width=300'
        });

        // The original file is untouched by save-as (still 400 from the previous test order,
        // but assert only that it still exists and kept its format to stay order-independent).
        getImageProperties(fileName).then(props => {
            expect(props['jcr:mimeType']).to.eq('image/jpeg');
        });
    });
});
