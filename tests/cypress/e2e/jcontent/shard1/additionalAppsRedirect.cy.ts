import {createSite, deleteSite} from '@jahia/cypress';
import {JContent} from '../../../page-object';

const TAG_MANAGER_APP_KEY = 'jctagsmanager';

describe('Additional apps redirect', () => {
    const siteKey = 'additionalAppsTest';
    let appNotFoundSeen = false;

    // The site permissions query is what the Additional route waits on before resolving an app.
    // Holding it open turns a sub-second race into a window the test can observe.
    const holdSitePermissions = (ms: number) => {
        cy.intercept('POST', '**/modules/graphql', req => {
            if (JSON.stringify(req.body).includes('installedModulesWithAllDependencies')) {
                req.on('response', res => {
                    res.setDelay(ms);
                });
            }
        });
    };

    // A retried should('not.exist') passes as soon as the text clears, so it cannot see a transient.
    // Record every DOM mutation instead, and assert on the recording at the end.
    const recordAppNotFound = () => {
        appNotFoundSeen = false;
        cy.on('window:before:load', win => {
            const scan = () => {
                if (win.document.body && /app not found/i.test(win.document.body.innerText)) {
                    appNotFoundSeen = true;
                }
            };

            win.document.addEventListener('DOMContentLoaded', () => {
                scan();
                new win.MutationObserver(scan).observe(win.document.body, {
                    childList: true, subtree: true, characterData: true
                });
            });
        });
    };

    const assertNeverShowedAppNotFound = () => {
        cy.then(() => {
            expect(appNotFoundSeen, '"App not found" rendered at some point').to.equal(false);
        });
    };

    before(function () {
        deleteSite(siteKey);
        createSite(siteKey, {
            templateSet: 'dx-base-demo-templates',
            serverName: 'localhost',
            locale: 'en'
        });
    });

    after(function () {
        cy.logout();
        deleteSite(siteKey);
    });

    beforeEach(function () {
        cy.loginAndStoreSession();
        recordAppNotFound();
        holdSitePermissions(4000);
    });

    it('opens the first app without ever showing "App not found"', () => {
        JContent.visit(siteKey, 'en', 'apps');

        cy.url({timeout: 30000}).should('include', `apps/${TAG_MANAGER_APP_KEY}`);
        cy.get('[data-cm-role="tag-manager-content"]', {timeout: 30000}).should('be.visible');

        assertNeverShowedAppNotFound();
    });

    it('opens an app addressed directly without ever showing "App not found"', () => {
        // JContent restores the last location, so this is the URL a returning user lands on
        JContent.visit(siteKey, 'en', `apps/${TAG_MANAGER_APP_KEY}`);

        cy.get('[data-cm-role="tag-manager-content"]', {timeout: 30000}).should('be.visible');

        assertNeverShowedAppNotFound();
    });

    it('leaves the Additional section with Back after the redirect', () => {
        const jcontent = JContent.visit(siteKey, 'en', 'pages/home');
        cy.window().then(win => win.localStorage.removeItem(`jcontent-previous-location-${siteKey}-apps`));

        jcontent.getAccordionItem('apps').click();
        cy.url({timeout: 30000}).should('include', `apps/${TAG_MANAGER_APP_KEY}`);

        cy.go('back');
        cy.url({timeout: 30000}).should('include', '/pages/home');
    });

    it('still shows "App not found" for an app key that does not exist', () => {
        JContent.visit(siteKey, 'en', 'apps/doesNotExist');

        cy.contains('App not found', {timeout: 30000}).should('be.visible');
    });
});
