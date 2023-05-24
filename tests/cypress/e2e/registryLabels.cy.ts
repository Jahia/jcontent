import {JContent} from "../page-object";

describe('Registry labels test', () => {
    before(function () {
        cy.login();
    });

    after(function () {
       cy.logout();
    });

    it('Shows labels on required elements', () => {
        JContent.visit('digitall', 'en', 'pages/home');
        cy.get('section[data-registry-key="accordionItem:pages"]')
            .should('exist')
            .invoke('attr', 'data-registry-target')
            .should('eq', 'jcontent:50');

        cy.get('section[data-registry-key="accordionItem:apps"]')
            .should('exist')
            .invoke('attr', 'data-registry-target')
            .should('eq', 'jcontent:80');

        cy.get('li[data-registry-key="primary-nav-item:jcontent"]')
            .should('exist')
            .invoke('attr', 'data-registry-target')
            .should('eq', 'nav-root-top:2');


        cy.get('li[data-sel-role="home"]').rightclick();
        cy.get('li[data-registry-key="action:createPage"]')
            .should('exist')
            .invoke('attr', 'data-registry-target')
            .should('eq', 'contentActions:-2');

        cy.get('li[data-registry-key="action:editPage"]')
            .should('exist')
            .invoke('attr', 'data-registry-target')
            .should('eq', 'contentActions:2');
    });
});
