import {JContent, JContentPageBuilder} from '../../page-object';
import {createSite, deleteSite, enableModule} from '@jahia/cypress';

describe('Page builder - Navigation', () => {
    let jcontent: JContentPageBuilder;

    it('should switch language', () => {
        cy.loginAndStoreSession();
        jcontent = JContent.visit('digitall', 'en', 'pages/home').switchToPageBuilder();
        jcontent.iframe().get().find('#languages.pull-right').children('a').click();
        jcontent.iframe().get().find('#languages.pull-right').contains('German').click({multiple: true});
        jcontent.getLanguageSwitcher().get().contains('de');
    });

    after(() => {
        cy.logout();
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
        });

        it('verify fullpage template exists', () => {
            cy.visit(`cms/render/default/en/sites/${pressReleaseSite}/home/pagecontent/test-press-release.fullpage.html`);
            cy.get('body').should('contain', 'Press Release 1 body');
        });

        it('Should show the non default content template named fullpage for press releases', () => {
            jcontent = JContent.visit(pressReleaseSite, 'en', 'pages/home').switchToPageBuilder();
            jcontent.getModule(`/sites/${pressReleaseSite}/home/pagecontent/test-press-release`).get().contains('Press Release 1 title').click({force: true});
            cy.frameLoaded('[data-sel-role="page-builder-frame-active"]', {url: '/test-press-release.fullpage.html'});
            jcontent = new JContentPageBuilder(new JContent(), 'fullpage');
            jcontent.getMainModule(`/sites/${pressReleaseSite}/home/pagecontent/test-press-release`).get().should('contain', 'Press Release 1 body');
            jcontent.getAccordionItem('pages').getTreeItem('home').click();
            jcontent = new JContentPageBuilder(new JContent(), 'homeDefault');
            jcontent.getModule(`/sites/${pressReleaseSite}/home/pagecontent/test-press-release`).get().should('not.contain', 'Press Release 1 body');
        });

        it('Should switch site and kept track of templates', () => {
            jcontent = JContent.visit(pressReleaseSite, 'en', 'pages/home').switchToPageBuilder();
            jcontent.getModule(`/sites/${pressReleaseSite}/home/pagecontent/test-press-release`).get().contains('Press Release 1 title').click({force: true});
            cy.frameLoaded('[data-sel-role="page-builder-frame-active"]', {url: '/test-press-release.fullpage.html'});
            jcontent.getSiteSwitcher().select('Digitall');
            jcontent.getAccordionItem('pages').getTreeItem('home').expand();
            jcontent.getAccordionItem('pages').getTreeItem('demo-roles-and-users').click();
            jcontent.getMainModule('/sites/digitall/home/demo-roles-and-users').get().should('contain', 'How to use this demonstration');
            jcontent.getSiteSwitcher().select('pressReleaseSite');
            cy.frameLoaded('[data-sel-role="page-builder-frame-active"]', {url: '/test-press-release.fullpage.html'});
            jcontent = new JContentPageBuilder(new JContent(), 'fullpage');
            jcontent.getMainModule(`/sites/${pressReleaseSite}/home/pagecontent/test-press-release`).get().should('contain', 'Press Release 1 body');
        });

        it('Should switch accordion and kept track of templates', () => {
            jcontent = JContent.visit(pressReleaseSite, 'en', 'pages/home').switchToPageBuilder();
            jcontent.getModule(`/sites/${pressReleaseSite}/home/pagecontent/test-press-release`).get().contains('Press Release 1 title').click({force: true});
            cy.frameLoaded('[data-sel-role="page-builder-frame-active"]', {url: '/test-press-release.fullpage.html'});
            jcontent.getAccordionItem('content-folders').click();
            jcontent.getAccordionItem('content-folders').getTreeItem('contents').click();
            jcontent.getAccordionItem('pages').click();
            cy.frameLoaded('[data-sel-role="page-builder-frame-active"]', {url: '/test-press-release.fullpage.html'});
            jcontent = new JContentPageBuilder(new JContent(), 'fullpage');
            jcontent.getMainModule(`/sites/${pressReleaseSite}/home/pagecontent/test-press-release`).get().should('contain', 'Press Release 1 body');
        });
    });
});
