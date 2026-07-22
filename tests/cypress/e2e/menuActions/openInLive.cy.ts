import {Button, createSite, deleteSite, getComponentByRole, publishAndWaitJobEnding} from '@jahia/cypress';
import {JContent} from '../../page-object';
import gql from 'graphql-tag';

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

        it('does not show current domain section when localhost is in the server names list', () => {
            visitWithStub();
            getComponentByRole(Button, 'openInLiveChevron').click();
            cy.get('.moonstone-menu:not(.moonstone-hidden)').should('be.visible');
            cy.contains('Current domain').should('not.exist');
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
});
