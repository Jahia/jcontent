import {ContentEditor, JContent} from '../../page-object';
import {RichTextField} from '../../page-object/fields';

describe('Create content tests', {retries: 10}, () => {
    let jcontent: JContent;

    before(function () {
        cy.executeGroovy('contentEditor/createSite.groovy', {SITEKEY: 'contentEditorSite'});
        cy.apollo({mutationFile: 'contentEditor/references.graphql'});
    });

    after(function () {
        cy.executeGroovy('contentEditor/deleteSite.groovy', {SITEKEY: 'contentEditorSite'});
    });

    beforeEach(() => {
        cy.loginAndStoreSession();
        jcontent = JContent.visit('contentEditorSite', 'en', 'content-folders/contents');
    });

    afterEach(() => {
        cy.logout();
    });

    it('can edit content', () => {
        jcontent.getTable().getRowByLabel('Rich text').contextMenu().select('Edit');
        const contentEditor = new ContentEditor();
        contentEditor.getField(RichTextField, 'jnt:bigText_text');
        contentEditor.cancel();
    });

    it('can edit source ref', () => {
        jcontent.getTable().getRowByLabel('Content reference').contextMenu().select('Edit reference source');
        const contentEditor = new ContentEditor();
        contentEditor.getField(RichTextField, 'jnt:bigText_text');
        contentEditor.cancel();
    });
});
