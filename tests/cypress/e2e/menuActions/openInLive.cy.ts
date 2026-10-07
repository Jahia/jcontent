import {Button, createSite, deleteSite, getComponentByRole, getNodeByPath, publishAndWaitJobEnding} from '@jahia/cypress';
import {JContent} from '../../page-object';
import gql from 'graphql-tag';

const currentHostname = new URL(Cypress.config('baseUrl')).hostname;

// The live page carries the uuid of the site that rendered it, so the check fails when
// Jahia resolves the URL to another site.
const expectOpenedUrlRendersSite = (siteKey: string) => {
    getNodeByPath(`/sites/${siteKey}`).then(res => {
        const siteUuid = res.data.jcr.nodeByPath.uuid;
        cy.get('@winOpen').its('lastCall.args.0').then((url: string) => {
            cy.request(url).its('body').then((body: string) => {
                expect(/"siteUuid":"([^"]+)"/.exec(body)?.[1], `site rendered at ${url}`).to.equal(siteUuid);
            });
        });
    });
};

describe('Open in Live tests', () => {
    const siteKey = 'openInLiveSite';
    const storageKey = 'jcontent-live-servername';
    const serverName = 'localhost';
    const alias1 = 'alias1.example.com';
    const alias2 = 'alias2.example.com';

    const visitWithStub = (preloadStorage?: Record<string, string>) =>
        JContent.visit(siteKey, 'en', 'pages/home', {
            onBeforeLoad(win: Window) {
                if (preloadStorage) {
                    Object.entries(preloadStorage).forEach(([k, v]) => win.localStorage.setItem(k, v));
                }

                // @ts-expect-error window definition does not have "open" for some reason
                cy.stub(win, 'open').as('winOpen');
            }
        });

    before(() => {
        createSite(siteKey, {templateSet: 'dx-base-demo-templates', serverName, locale: 'en'});
        cy.apollo({
            mutation: gql`
                mutation SetServerNameAliases($pathOrId: String!, $values: [String]!) {
                    jcr {
                        mutateNode(pathOrId: $pathOrId) {
                            mutateProperty(name: "j:serverNameAliases") {
                                setValues(values: $values)
                            }
                        }
                    }
                }
            `,
            variables: {
                pathOrId: `/sites/${siteKey}`,
                values: [alias1, alias2]
            }
        });
        publishAndWaitJobEnding(`/sites/${siteKey}/home`, ['en']);
        cy.loginAndStoreSession();
    });

    after(() => {
        cy.logout();
        deleteSite(siteKey);
    });

    beforeEach(() => {
        cy.clearLocalStorage();
        cy.loginAndStoreSession();
    });

    describe('primary Live button', () => {
        it('opens with default server name when localStorage is empty', () => {
            visitWithStub();
            getComponentByRole(Button, 'openInLive').click();
            cy.get('@winOpen').should(
                'be.calledWith',
                Cypress.sinon.match(f => f.includes(serverName) && !f.includes(alias1))
            );
        });

        it('opens with server name stored in localStorage', () => {
            visitWithStub({[storageKey]: alias1});
            getComponentByRole(Button, 'openInLive').click();
            cy.get('@winOpen').should('be.calledWith', Cypress.sinon.match(f => f.includes(alias1)));
        });
    });

    describe('dropdown menu', () => {
        it('shows default domain group with server name', () => {
            visitWithStub();
            getComponentByRole(Button, 'openInLiveChevron').click();
            cy.get('.moonstone-menu:not(.moonstone-hidden)').should('be.visible');
            cy.contains('Default domain').should('be.visible');
            cy.get('.moonstone-menu:not(.moonstone-hidden)').contains('.moonstone-menuItem', serverName).should('be.visible');
        });

        it('shows additional domains group with both aliases', () => {
            visitWithStub();
            getComponentByRole(Button, 'openInLiveChevron').click();
            cy.get('.moonstone-menu:not(.moonstone-hidden)').should('be.visible');
            cy.contains('Additional domain(s)').should('be.visible');
            cy.get('.moonstone-menu:not(.moonstone-hidden)').contains('.moonstone-menuItem', alias1).should('be.visible');
            cy.get('.moonstone-menu:not(.moonstone-hidden)').contains('.moonstone-menuItem', alias2).should('be.visible');
        });

        it('default server name is selected when localStorage is empty', () => {
            visitWithStub();
            getComponentByRole(Button, 'openInLiveChevron').click();
            cy.get('.moonstone-menu:not(.moonstone-hidden)').should('be.visible');
            cy.get('.moonstone-menu:not(.moonstone-hidden)').contains('.moonstone-menuItem', serverName)
                .should('have.class', 'moonstone-selected');
        });

        it('alias is pre-selected when stored in localStorage', () => {
            visitWithStub({[storageKey]: alias1});
            getComponentByRole(Button, 'openInLiveChevron').click();
            cy.get('.moonstone-menu:not(.moonstone-hidden)').should('be.visible');
            cy.get('.moonstone-menu:not(.moonstone-hidden)').contains('.moonstone-menuItem', alias1)
                .should('have.class', 'moonstone-selected');
        });

        it('shows current domain section for localhost-serverName site unless browsing from localhost', () => {
            // The site path in the live URL selects the site, so a hostname claimed by no site
            // renders the localhost site in its own context.
            // Browsing from localhost itself, the default domain already covers it.
            visitWithStub();
            getComponentByRole(Button, 'openInLiveChevron').click();
            cy.get('.moonstone-menu:not(.moonstone-hidden)').should('be.visible');
            if (currentHostname === serverName) {
                cy.contains('Current domain').should('not.exist');
            } else {
                cy.contains('Current domain').should('be.visible');
                cy.get('.moonstone-menu:not(.moonstone-hidden)').contains('.moonstone-menuItem', currentHostname).click();
                cy.get('@winOpen').should('be.calledWith', Cypress.sinon.match(f => f.includes(`//${currentHostname}`)));
                expectOpenedUrlRendersSite(siteKey);
            }
        });

        it('selecting an alias opens URL with that alias', () => {
            visitWithStub();
            getComponentByRole(Button, 'openInLiveChevron').click();
            cy.get('.moonstone-menu:not(.moonstone-hidden)').should('be.visible');
            cy.get('.moonstone-menu:not(.moonstone-hidden)').contains('.moonstone-menuItem', alias1).click();
            cy.get('@winOpen').should('be.calledWith', Cypress.sinon.match(f => f.includes(alias1)));
        });

        it('selecting an alias stores it in localStorage', () => {
            visitWithStub();
            getComponentByRole(Button, 'openInLiveChevron').click();
            cy.get('.moonstone-menu:not(.moonstone-hidden)').should('be.visible');
            cy.get('.moonstone-menu:not(.moonstone-hidden)').contains('.moonstone-menuItem', alias1).click();
            cy.window().then(win => {
                expect(win.localStorage.getItem(storageKey)).to.equal(alias1);
            });
        });

        it('primary button uses alias selected from dropdown on next click', () => {
            visitWithStub();
            getComponentByRole(Button, 'openInLiveChevron').click();
            cy.get('.moonstone-menu:not(.moonstone-hidden)').should('be.visible');
            cy.get('.moonstone-menu:not(.moonstone-hidden)').contains('.moonstone-menuItem', alias1).click();
            getComponentByRole(Button, 'openInLive').click();
            cy.get('@winOpen').should('be.calledTwice');
            cy.get('@winOpen').should('be.calledWith', Cypress.sinon.match(f => f.includes(alias1)));
        });
    });

    describe('localStorage validation', () => {
        it('resets to default server name when stored value is not in server names list', () => {
            visitWithStub({[storageKey]: 'unknown.invalid.host'});
            // Wait for Live button — component mounted and reset effect has run
            getComponentByRole(Button, 'openInLive').should('be.visible');
            cy.window().then(win => {
                expect(win.localStorage.getItem(storageKey)).to.equal(serverName);
            });
            getComponentByRole(Button, 'openInLive').click();
            cy.get('@winOpen').should(
                'be.calledWith',
                Cypress.sinon.match(f => f.includes(serverName) && !f.includes('unknown.invalid.host'))
            );
        });
    });

    describe('current domain — cross-site hostname guard', () => {
        // Guard 2: "Current domain" must not appear when the current hostname is already the
        // server name of a different Jahia site (opening it would render that other site instead).
        const extSiteKey = 'openInLiveSiteExt';
        const extServerName = 'external.example.com';

        const visitExtWithStub = () =>
            JContent.visit(extSiteKey, 'en', 'pages/home', {
                onBeforeLoad(win: Window) {
                    // @ts-expect-error window definition does not have "open" for some reason
                    cy.stub(win, 'open').as('winOpen');
                }
            });

        before(() => {
            createSite(extSiteKey, {templateSet: 'dx-base-demo-templates', serverName: extServerName, locale: 'en'});
            publishAndWaitJobEnding(`/sites/${extSiteKey}/home`, ['en']);
            cy.loginAndStoreSession();
        });

        after(() => {
            cy.logout();
            deleteSite(extSiteKey);
        });

        beforeEach(() => {
            cy.clearLocalStorage();
            cy.loginAndStoreSession();
        });

        it('shows current domain section when current hostname is not claimed by any site', () => {
            // No site in the test environment has serverName=currentHostname → guard 2 does not fire.
            // Guard 1 also does not fire (extServerName is not currentHostname).
            // "Current domain: currentHostname" must appear.
            visitExtWithStub();
            getComponentByRole(Button, 'openInLiveChevron').click();
            cy.get('.moonstone-menu:not(.moonstone-hidden)').should('be.visible');
            cy.contains('Current domain').should('be.visible');
            cy.get('.moonstone-menu:not(.moonstone-hidden)')
                .contains('.moonstone-menuItem', currentHostname)
                .click();
            expectOpenedUrlRendersSite(extSiteKey);
        });

        it('does not show current domain section when current hostname is claimed by another site', () => {
            // Add currentHostname as an alias on the OTHER site (openInLiveSite) so guard 2 fires
            // when viewing openInLiveSiteExt — Jahia would resolve currentHostname to openInLiveSite.
            const setAliases = (values: string[]) => cy.apollo({
                mutation: gql`
                    mutation SetServerNameAliases($pathOrId: String!, $values: [String]!) {
                        jcr {
                            mutateNode(pathOrId: $pathOrId) {
                                mutateProperty(name: "j:serverNameAliases") {
                                    setValues(values: $values)
                                }
                            }
                        }
                    }
                `,
                variables: {pathOrId: `/sites/${siteKey}`, values}
            });

            setAliases([alias1, alias2, currentHostname]);

            visitExtWithStub();
            getComponentByRole(Button, 'openInLiveChevron').click();
            cy.get('.moonstone-menu:not(.moonstone-hidden)').should('be.visible');
            cy.contains('Current domain').should('not.exist');

            setAliases([alias1, alias2]);
        });
    });

    describe('shared localhost-only content', () => {
        // Shared content (e.g. from the system site) resolves to a localhost-only site while the selected
        // site (state.site) has a real server name. Open in Live must use the selected site's hostname.
        const sharedSiteKey = 'openInLiveSiteShared';
        const selectedSiteKey = 'openInLiveSiteSelected';
        const selectedServerName = 'selected.example.com';

        before(() => {
            createSite(sharedSiteKey, {templateSet: 'dx-base-demo-templates', serverName, locale: 'en'});
            createSite(selectedSiteKey, {templateSet: 'dx-base-demo-templates', serverName: selectedServerName, locale: 'en'});
            publishAndWaitJobEnding(`/sites/${sharedSiteKey}/home`, ['en']);
            publishAndWaitJobEnding(`/sites/${selectedSiteKey}/home`, ['en']);
            cy.loginAndStoreSession();
        });

        after(() => {
            cy.logout();
            deleteSite(sharedSiteKey);
            deleteSite(selectedSiteKey);
        });

        beforeEach(() => {
            cy.clearLocalStorage();
            cy.loginAndStoreSession();
        });

        it('opens shared localhost-only content on the selected site hostname', function () {
            if (currentHostname === serverName) {
                // The localhost-only case only applies when browsing from a real hostname.
                this.skip();
            }

            // Browse the selected site, but make the Open in Live query resolve a node of the shared
            // (localhost-only) site, as shared content would.
            cy.intercept('POST', '**/modules/graphql', req => {
                const ops = Array.isArray(req.body) ? req.body : [req.body];
                ops.forEach(op => {
                    if (op.operationName === 'openInActionQuery' && op.variables?.workspace === 'LIVE') {
                        op.variables.path = `/sites/${sharedSiteKey}/home`;
                    }
                });
            });

            JContent.visit(selectedSiteKey, 'en', 'pages/home', {
                onBeforeLoad(win: Window) {
                    // @ts-expect-error window definition does not have "open" for some reason
                    cy.stub(win, 'open').as('winOpen');
                }
            });
            getComponentByRole(Button, 'openInLive').click();

            cy.get('@winOpen').should(
                'be.calledWith',
                Cypress.sinon.match(f => f.includes(`//${selectedServerName}`) && !f.includes(`//${currentHostname}`))
            );

            // The selected hostname is not resolvable from the test runner: request the same URL path
            // on the runner's host. The site path in the URL selects the rendered site.
            cy.get('@winOpen').its('lastCall.args.0').then((url: string) => {
                const reachable = new URL(url);
                reachable.hostname = currentHostname;
                cy.wrap(reachable.toString()).as('reachableUrl');
            });
            getNodeByPath(`/sites/${sharedSiteKey}`).then(res => {
                const siteUuid = res.data.jcr.nodeByPath.uuid;
                cy.get('@reachableUrl').then((url: unknown) => {
                    cy.request(url as string).its('body').then((body: string) => {
                        expect(/"siteUuid":"([^"]+)"/.exec(body)?.[1], `site rendered at ${url}`).to.equal(siteUuid);
                    });
                });
            });
        });
    });
});
