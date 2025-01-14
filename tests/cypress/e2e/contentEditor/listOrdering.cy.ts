import {JContent} from '../../page-object';

describe('Test list ordering', () => {
    const siteKey = 'digitall';

    beforeEach(() => {
        cy.login(); // Edit in chief
    });

    afterEach(() => {
        cy.logout();
    });

    it('Verifies that list ordering section is available', () => {
        const contentEditor = JContent.visit(siteKey, 'en', 'pages/home/investors/events/Events').editContent();
        contentEditor.getSection('listOrdering').should('exist');
    });
});
