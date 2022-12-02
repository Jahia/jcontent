import {JContent} from '../page-object';
import {Button, getComponentByRole} from '@jahia/cypress';

describe('Menu tests', () => {
    beforeEach(function () {
        cy.executeGroovy('jcontent/createSite.groovy', {SITEKEY: 'jcontentSite'});
        cy.apollo({mutationFile: 'jcontent/createContent.graphql'});
        cy.login(); // Edit in chief
    });

    afterEach(function () {
        cy.logout();
        cy.executeGroovy('jcontent/deleteSite.groovy', {SITEKEY: 'jcontentSite'});
    });

    it('Can edit content', function () {
        const jcontent = JContent.visit('jcontentSite', 'en', 'pages/home');
        jcontent.getTable().getRowByIndex(1).contextMenu().select('Delete');

        cy.contains('.x-btn-text', 'No').click();
    });

    it('Can download file', function () {
        const jcontent = JContent.visit('jcontentSite', 'en', 'media/files/bootstrap/css');
        jcontent.switchToListMode();
        jcontent.getTable().getRowByIndex(1).contextMenu().select('Download');
        cy.window().then(win => {
            console.log(win);
        });
        getComponentByRole(Button, 'download-cancel').click();
    });
});
