import {createSite, deleteSite, enableModule} from '@jahia/cypress';
import {createSubpages} from '../../fixtures/contentEditor/referenceCard/referenceCard.utils';
import {JContent} from '../../page-object';

describe('Content Editor - Reference Card', () => {
    const siteKey = 'referenceCardTestSite';

    before(() => {
        createSite(siteKey);
        enableModule('jcontent-test-module', siteKey);
        createSubpages(siteKey);
    });

    beforeEach(() => {
        cy.login();
    });

    after(() => {
        cy.logout();
        deleteSite(siteKey);
    });

    it('should display reference card with correct content', () => {
        const ce = JContent.visit(siteKey, 'en', 'pages/home').editPage();

        // eslint-disable-next-line cypress/no-unnecessary-waiting
        cy.wait(1000); // Delay for focusing on the first field before scrolling to view
        const listOrdering = ce.getSection('listOrdering').get();
        listOrdering.scrollIntoView();
        // Get original order of IDs as @orderIds
        listOrdering.find('[draggable]').then($els => {
            const orderIds = [...$els].map(el => el.dataset.handlerId);
            cy.wrap(orderIds).as('orderIds');
        });

        cy.log('Verify move up/first buttons are disabled');
        cy.get('@orderIds').then(orderIds => {
            ce.getSection('listOrdering').get()
                .find(`[draggable][data-handler-id="${orderIds[0]}"]`)
                .should('be.visible')
                .realHover();
            ce.getSection('listOrdering').get()
                .find(`[draggable][data-handler-id="${orderIds[0]}"]`)
                .find('[data-sel-action^="moveUp"]')
                .should('have.attr', 'disabled');
            ce.getSection('listOrdering').get()
                .find(`[draggable][data-handler-id="${orderIds[0]}"]`)
                .find('[data-sel-action^="moveToFirst"]')
                .should('have.attr', 'disabled');
        });

        cy.log('Verify move down/last buttons are disabled');
        cy.get('@orderIds').then(orderIds => {
            ce.getSection('listOrdering').get()
                .find(`[draggable][data-handler-id="${orderIds[4]}"]`)
                .should('be.visible')
                .realHover();
            ce.getSection('listOrdering').get()
                .find(`[draggable][data-handler-id="${orderIds[4]}"]`)
                .find('[data-sel-action^="moveDown"]')
                .should('have.attr', 'disabled');
            ce.getSection('listOrdering').get()
                .find(`[draggable][data-handler-id="${orderIds[4]}"]`)
                .find('[data-sel-action^="moveToLast"]')
                .should('have.attr', 'disabled');
        });

        cy.log('Test move down functionality');
        cy.get('@orderIds').then(orderIds => {
            cy.log(`Move down: ${orderIds.join(',')}`);
            const orderItem = ce.getSection('listOrdering').get().find(`[draggable][data-handler-id="${orderIds[1]}"]`);
            orderItem.should('be.visible').realHover();
            orderItem.find('[data-sel-action^="moveDown"]').should('be.visible').click();
            cy.get(`[data-handler-id="${orderIds[2]}"] + [data-handler-id="${orderIds[1]}"]`).scrollIntoView();
            cy.get(`[data-handler-id="${orderIds[2]}"] + [data-handler-id="${orderIds[1]}"]`).should('be.visible'); // 0, 2, 1, 3, 4
        });

        cy.log('Test move up functionality');
        cy.get('@orderIds').then(orderIds => {
            cy.log(`Move up: ${orderIds.join(',')}`);
            const orderItem = ce.getSection('listOrdering').get().find(`[draggable][data-handler-id="${orderIds[4]}"]`);
            orderItem.should('be.visible').realHover();
            orderItem.find('[data-sel-action^="moveUp"]').should('be.visible').click();
            cy.get(`[data-handler-id="${orderIds[1]}"] + [data-handler-id="${orderIds[4]}"]`).scrollIntoView();
            cy.get(`[data-handler-id="${orderIds[1]}"] + [data-handler-id="${orderIds[4]}"]`).should('be.visible'); // 0, 2, 1, 4, 3
        });

        cy.log('Test move last functionality');
        cy.get('@orderIds').then(orderIds => {
            cy.log(`Move last: ${orderIds.join(',')}`);
            const section = ce.getSection('listOrdering').get();
            const orderItem = section.find(`[draggable][data-handler-id="${orderIds[2]}"]`);
            orderItem.should('be.visible').realHover();
            orderItem.find('[data-sel-action^="moveToLast"]').should('be.visible').click();
            cy.get('[draggable][data-handler-id]').last().should('contain', 'test-page2'); // 0, 1, 4, 3, 2
        });

        cy.log('Test move first functionality');
        cy.get('@orderIds').then(orderIds => {
            cy.log(`Move first: ${orderIds.join(',')}`);
            const section = ce.getSection('listOrdering').get();
            const orderItem = section.find(`[draggable][data-handler-id="${orderIds[2]}"]`);
            orderItem.should('be.visible').realHover();
            orderItem.find('[data-sel-action^="moveToFirst"]').should('be.visible').click();
            cy.get('[draggable][data-handler-id]').first().should('contain', 'test-page2'); // 2, 0, 1, 4, 3
        });

        ce.save();
    });
});
