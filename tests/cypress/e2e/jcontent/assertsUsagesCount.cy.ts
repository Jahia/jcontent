import {JContent} from '../../page-object';

describe('Assets usages count in list and grid', () => {
    beforeEach(() => {
        cy.login();
    });

    it('should show media usages in list view', () => {
        const jcontent = JContent
            .visit('digitall', 'en', 'media/files/images/banners')
            .switchToListMode();

        const row = jcontent.getTable().getRowByName('editing-digitall-site.jpg');
        row.get().find('td[data-cm-role="table-content-list-cell-usages"]').should('contain.text', '3');
    });

    it('should show media usages in thumbnail view', () => {
        const jcontent = JContent
            .visit('digitall', 'en', 'media/files/images/banners')
            .switchToThumbnails();

        const row = jcontent.getGrid().getCardByName('editing-digitall-site.jpg');
        row.get().should('contain.text', '3 usages');
    });
});
