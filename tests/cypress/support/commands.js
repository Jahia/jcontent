// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

Cypress.Commands.add('loginEditor', () => {
    cy.session('editor', () => {
        cy.login(); // Edit in chief
    }, {
        validate() {
            cy.request('/start').its('status').should('eq', 200);
        }
    });
});

import 'cypress-iframe';
import "cypress-real-events";
