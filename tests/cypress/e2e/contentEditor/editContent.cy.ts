import {ContentEditor, JContent} from '../../page-object';
import {RichTextField} from '../../page-object/fields';
import {createSite, deleteSite} from '@jahia/cypress';

describe('Create content tests', () => {
    let jcontent: JContent;
    const siteKey = 'contentEditorSite';

    before(() => {
        createSite(siteKey);
        cy.apollo({mutationFile: 'contentEditor/references.graphql'});
    });

    after(() => {
        deleteSite(siteKey);
        cy.logout();
    });

    beforeEach(() => {
        cy.loginAndStoreSession();
        jcontent = JContent.visit(siteKey, 'en', 'content-folders/contents');
    });

    it('can edit content', () => {
        jcontent.getTable().getRowByLabel('Rich text').contextMenu().select('Edit');
        const contentEditor = new ContentEditor();
        cy.get('.moonstone-chip').contains('Rich text');
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
