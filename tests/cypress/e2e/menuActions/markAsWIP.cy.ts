import {createSite, addNode, deleteSite, getComponentByRole, Button} from '@jahia/cypress';
import {ContentEditor, JContent} from '../../page-object';

describe('Mark as WIP action tests', () => {
    const siteKey = 'wipSite';
    const parentPath = `/sites/${siteKey}/contents`;

    before('setup site and contents', () => {
        createSite(siteKey, {
            languages: 'en,fr',
            templateSet: 'dx-base-demo-templates',
            serverName: 'localhost',
            locale: 'en'
        });

        addNode({
            parentPathOrId: parentPath,
            primaryNodeType: 'jnt:text',
            name: 'wipALL',
            properties: [
                {name: 'j:workInProgressLanguages', values: []},
                {name: 'j:workInProgressStatus', value: 'ALL_CONTENT'}
            ]
        });

        addNode({
            parentPathOrId: parentPath,
            primaryNodeType: 'jnt:text',
            name: 'wipFR',
            properties: [
                {name: 'j:workInProgressLanguages', values: ['fr']},
                {name: 'j:workInProgressStatus', value: 'LANGUAGES'}
            ]
        });
    });

    after('cleanup site', () => {
        deleteSite(siteKey);
    });

    beforeEach(() => {
        cy.loginAndStoreSession();
    });

    it('shows correct WIP banner and action in EN', () => {
        const jcontent = JContent.visit(siteKey, 'en', 'content-folders/contents');
        let ce: ContentEditor;

        cy.log('Verify wipALL shows unmark WIP action');
        ce = jcontent.editComponentByRowName('wipALL');
        cy.get('[data-sel-role="wip-info-chip"]').should('be.visible');
        getComponentByRole(Button, 'goToWorkInProgress').should('contain', 'Unmark as Work in progress');
        ce.cancel();

        cy.log('Verify wipFR shows mark WIP action');
        ce = jcontent.editComponentByRowName('wipFR');
        cy.get('[data-sel-role="wip-info-chip"]', {timeout: 5000}).should('not.exist');
        getComponentByRole(Button, 'goToWorkInProgress').should('contain', 'Mark as Work in progress');
        ce.cancel();
    });

    it('shows correct WIP banner and action in FR', () => {
        const jcontent = JContent.visit(siteKey, 'fr', 'content-folders/contents');
        let ce: ContentEditor;

        cy.log('Verify wipALL shows unmark WIP action');
        ce = jcontent.editComponentByRowName('wipALL');
        cy.get('[data-sel-role="wip-info-chip"]').should('be.visible');
        getComponentByRole(Button, 'goToWorkInProgress').should('contain', 'Unmark as Work in progress');
        ce.cancel();

        cy.log('Verify wipFR shows unmark WIP action');
        ce = jcontent.editComponentByRowName('wipFR');
        cy.get('[data-sel-role="wip-info-chip"]', {timeout: 5000}).should('be.visible');
        getComponentByRole(Button, 'goToWorkInProgress').should('contain', 'Unmark as Work in progress');
        ce.cancel();
    });
});

