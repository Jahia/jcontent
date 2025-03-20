import {JContent, JContentPageBuilder} from '../../page-object/jcontent';
import {
    Button,
    createSite,
    createUser,
    deleteSite,
    deleteUser,
    enableModule,
    getComponent,
    getComponentByRole,
    grantRoles,
    markForDeletion
} from '@jahia/cypress';
import {UndeleteDialog} from '../../page-object/deleteDialog';

describe('Page builder - content status', () => {
    let jContentPageBuilder: JContentPageBuilder;
    const siteKey = 'contentStatusSite';
    const user = {name: 'myUser', password: 'password'};

    function getContent(page: string, relPath: string) {
        return jContentPageBuilder.getModule(`/sites/${siteKey}/home/${page}/area-main/${relPath}`);
    }

    before(() => {
        createSite(siteKey, {
            languages: 'en,fr,de',
            templateSet: 'dx-base-demo-templates',
            serverName: 'localhost',
            locale: 'en'
        });
        enableModule('qa-module', siteKey);
        cy.apollo({
            mutationFile: 'pageBuilder/contentStatus.graphql',
            variables: {homePath: `/sites/${siteKey}/home`}
        });
        createUser(user.name, user.password);
    });

    after(() => {
        cy.logout();
        deleteUser(user.name);
        deleteSite(siteKey);
    });

    describe('test always-on statuses', {testIsolation: false}, () => {
        const page = 'alwaysPage';
        before(() => {
            markForDeletion(`/sites/${siteKey}/home/${page}/area-main/wip-for-deletion`);
            cy.loginAndStoreSession();
            jContentPageBuilder = JContent
                .visit(siteKey, 'en', `pages/home/${page}`)
                .switchToPageBuilder();
        });

        it('should display WIP status', () => {
            getContent(page, 'wip-all').getBoxStatus('workInProgress').should('be.visible');
            getContent(page, 'wip-en').getBoxStatus('workInProgress').should('be.visible');

            cy.log('Should not display status when deleted');
            getContent(page, 'wip-for-deletion').getForDeletionStatus().should('be.visible');
            // No content statuses to display means no box is rendered
            getContent(page, 'wip-for-deletion').assertNoBox();

            cy.log('Should display status when undeleted');
            getContent(page, 'wip-for-deletion').select();
            getComponentByRole(Button, 'undelete').click();
            getComponent(UndeleteDialog).undelete();
            jContentPageBuilder.clearSelection();
            getContent(page, 'wip-for-deletion').getBoxStatus('workInProgress').should('be.visible');

            cy.log('wip-en should have no WIP status for FR language');
            jContentPageBuilder.getLanguageSwitcher().select('fr');
            getContent(page, 'wip-en').getBoxStatus('noTranslation').should('be.visible').and('contain', 'FR');
            getContent(page, 'wip-en').assertNoBoxStatus('workInProgress');
        });

        it('should display no visibility (language), untranslated badges', () => {
            cy.log('should display untranslated badge');
            getContent(page, 'wip-all').getBoxStatus('workInProgress').should('be.visible');
            getContent(page, 'wip-all').getBoxStatus('noTranslation').should('be.visible').and('contain', 'FR');
            getContent(page, 'wip-all').getBox().should('contain', 'Nothing to display');

            cy.log('should display untranslated badge (with visible content)');
            getContent(page, 'visibility-lang-with-display-content').getBoxStatus('noTranslation').should('be.visible').and('contain', 'FR');
            getContent(page, 'visibility-lang-with-display-content').getBox().should('not.contain', 'Nothing to display');

            cy.log('should display no visibility badge');
            getContent(page, 'visibility-lang').getBoxStatus('notVisible').should('be.visible');
            getContent(page, 'visibility-lang').getBox().should('contain', 'Nothing to display');
        });
    });

    describe('Publication status', {testIsolation: false}, () => {
        const page = 'publicationPage';
        before(() => {
            cy.loginAndStoreSession();
            jContentPageBuilder = JContent
                .visit(siteKey, 'en', `pages/home/${page}`)
                .switchToPageBuilder();
        });

        it('does not show any publication status when page is not published', () => {
            jContentPageBuilder.getStatusSelector().assertCount('published', 0);
            jContentPageBuilder.getStatusSelector().showPublication();
            getContent(page, 'wip-all').getBoxStatus('workInProgress').should('be.visible');
            getContent(page, 'wip-all').getBoxStatus('workInProgress').should('be.visible');
            getContent(page, 'wip-en').assertNoBoxStatus('notPublished');
            getContent(page, 'wip-en').assertNoBoxStatus('notPublished');
        });

        it('shows publication status when page is published', () => {
            cy.get('[data-sel-role="publishMenu').click();
            jContentPageBuilder.publishAll();

            jContentPageBuilder.getStatusSelector().assertCount('published', 2);
            jContentPageBuilder.getStatusSelector().showPublication();
            getContent(page, 'wip-all').getBoxStatus('workInProgress').should('be.visible');
            getContent(page, 'wip-all').getBoxStatus('workInProgress').should('be.visible');
            getContent(page, 'wip-en').getBoxStatus('notPublished').should('be.visible');
            getContent(page, 'wip-en').getBoxStatus('notPublished').should('be.visible');
        });
    });

    describe('Visibility and permissions status', {testIsolation: false}, () => {
        const page = 'visibilityPermissionPage';
        before(() => {
            // Add ACL permission override
            grantRoles(`/sites/${siteKey}/home/${page}/area-main/permission`, ['editor'], user.name, 'USER');
            cy.loginAndStoreSession();
            jContentPageBuilder = JContent
                .visit(siteKey, 'en', `pages/home/${page}`)
                .switchToPageBuilder();
        });

        it('shows visibility status', () => {
            jContentPageBuilder.getStatusSelector().assertCount('visibility', 2);
            getContent(page, 'visibility-lang').assertNoBox();
            getContent(page, 'visibility-datetime').assertNoBox();

            jContentPageBuilder.getStatusSelector().showVisibility();
            getContent(page, 'visibility-lang').getBoxStatus('visibilityConditions').should('be.visible');
            getContent(page, 'visibility-datetime').getBoxStatus('visibilityConditions').should('be.visible');
        });

        it('shows permission status', () => {
            jContentPageBuilder.getStatusSelector().assertCount('permissions', 1);
            jContentPageBuilder.getStatusSelector().showPermission();
            getContent(page, 'permission').getBoxStatus('permissions').should('be.visible');
        });

        it('does not include to status count when marked for deletion', () => {
            jContentPageBuilder.getStatusSelector().assertCount('permissions', 1);
            jContentPageBuilder.getStatusSelector().showPermission();
            markForDeletion(getContent(page, 'permission').path);
            jContentPageBuilder.refresh();
            jContentPageBuilder.getStatusSelector().assertCount('permissions', 0);
        });
    });
});
