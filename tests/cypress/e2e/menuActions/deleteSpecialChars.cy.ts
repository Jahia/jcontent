import {JContent} from '../../page-object';
import {createSite, deleteSite, getComponent, uploadFile} from '@jahia/cypress';
import {DeleteDialog} from '../../page-object/deleteDialog';

const siteKey = 'jContentSite-deleteSpecialChars';
const nodeName = 'test.png';
const nodePath = `/sites/${siteKey}/files/${nodeName}`;
const SPECIAL_CHARS_PAYLOAD = '<img src=x onerror=alert(1)>';

describe('Delete dialog special characters rendering', () => {
    before(() => {
        createSite(siteKey);
        uploadFile('/assets/uploadMedia/myfile.png', `/sites/${siteKey}/files`, nodeName, 'image/png');
        cy.apollo({
            mutationFile: 'jcontent/jcrSetProperty.graphql',
            variables: {
                pathOrId: nodePath,
                property: 'jcr:title',
                value: SPECIAL_CHARS_PAYLOAD,
                language: 'en'
            }
        });
    });

    beforeEach(() => {
        cy.loginAndStoreSession();
    });

    after(() => {
        deleteSite(siteKey);
        cy.logout();
    });

    it('displays special characters in item names as text in the Mark for Deletion dialog', () => {
        cy.on('window:alert', cy.stub().as('alertStub'));

        const jcontent = JContent.visit(siteKey, 'en', 'media/files');
        jcontent.switchToListMode();
        jcontent.getTable().getRowByName(nodeName).contextMenu().select('Delete');

        // Wait for dialog data to finish loading (cancel-button only appears once query returns)
        cy.get('[data-sel-role="cancel-button"]').should('be.visible');

        cy.get('[data-sel-role="delete-message"]').within(() => {
            cy.get('img').should('not.exist');
            cy.contains(SPECIAL_CHARS_PAYLOAD).should('exist');
        });

        cy.get('@alertStub').should('not.have.been.called');

        getComponent(DeleteDialog).close();
    });
});
