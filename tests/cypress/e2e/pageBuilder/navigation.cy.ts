import {JContent, JContentPageBuilder} from '../../page-object';
import {createSite, deleteSite, enableModule} from '@jahia/cypress';

describe('Page builder - Navigation', () => {
    let jcontent: JContentPageBuilder;

    beforeEach(() => {
        cy.loginAndStoreSession();
        jcontent = JContent.visit('digitall', 'en', 'pages/home').switchToPageBuilder();
    });

    it('should switch language', () => {
        jcontent.iframe().get().find('#languages.pull-right').click();
        jcontent.iframe().get().find('#languages.pull-right').contains('German').click();
        jcontent.getLanguageSwitcher().get().contains('de');
    });

    describe('Non Default Content Template', () => {
        const pressReleaseSite = 'pressReleaseSite';
        before(() => {
            createSite(pressReleaseSite, {
                serverName: 'localhost',
                locale: 'en',
                templateSet: 'jcontent-test-template'
            });
            enableModule('press', pressReleaseSite);
            cy.apollo({
                mutationFile: 'pageBuilder/createPressReleaseContent.graphql',
                variables: {path: `/sites/${pressReleaseSite}/home`, date: new Date().toISOString()}
            });
        });

        after(() => {
            deleteSite(pressReleaseSite);
        });

        beforeEach(() => {
            cy.loginAndStoreSession();
            jcontent = JContent.visit(pressReleaseSite, 'en', 'pages/home').switchToPageBuilder();
        });

        it('should show the non default content template named fullpage for press releases', () => {
            jcontent.getModule(`/sites/${pressReleaseSite}/home/pagecontent/test-press-release`).get().contains('Press Release 1 title').click({force: true});
            cy.frameLoaded('[data-sel-role="page-builder-frame-active"]', {url: '/test-press-release.fullpage.html'});
            jcontent = new JContentPageBuilder(new JContent(), 'fullpage');
            jcontent.getMainModule(`/sites/${pressReleaseSite}/home/pagecontent/test-press-release`).get().should('contain', 'Press Release 1 body');
            jcontent.getAccordionItem('pages').getTreeItem('home').click();
            jcontent = new JContentPageBuilder(new JContent(), 'homeDefault');
            jcontent.getModule(`/sites/${pressReleaseSite}/home/pagecontent/test-press-release`).get().should('not.contain', 'Press Release 1 body');
        });
    });
});
