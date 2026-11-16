import {addNode, createSite, deleteSite} from '@jahia/cypress';
import {JContent} from '../../page-object';

describe('Export as CSV or JSON', () => {
    const siteKey = 'exportRecordsSite';
    const names = ['records-a', 'records-b'];
    const downloads = Cypress.config('downloadsFolder');

    const today = () => {
        const pad = (n: number) => String(n).padStart(2, '0');
        const now = new Date();
        return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
    };

    const visitAndSelect = () => {
        const jcontent = JContent.visit(siteKey, 'en', 'content-folders/contents').switchToListMode();
        names.forEach(name => jcontent.getTable().selectRowByName(name));
        cy.get('.moonstone-loader').should('not.exist');
        return jcontent;
    };

    const openExport = () => {
        cy.get('.moonstone-header button[data-sel-role="export"]').should('have.length', 1).click();
        cy.get('[data-cm-role="export-options"]').should('be.visible');
    };

    before(() => {
        createSite(siteKey, {templateSet: 'dx-base-demo-templates', serverName: 'localhost', locale: 'en'});
        names.forEach(name => addNode({
            parentPathOrId: `/sites/${siteKey}/contents`,
            name,
            primaryNodeType: 'jnt:bigText',
            properties: [{name: 'text', value: `<p>${name}</p>`, language: 'en'}]
        }));
    });

    beforeEach(() => {
        cy.loginAndStoreSession();
    });

    after(() => {
        deleteSite(siteKey);
        cy.logout();
    });

    it('offers Export in the selection toolbar and not in the Bulk menu', () => {
        visitAndSelect();
        cy.get('.moonstone-header button[data-sel-role="export"]').should('have.length', 1);
        cy.get('.moonstone-header button[data-sel-role="bulkActionsMenu"]').click();
        cy.get('li[data-sel-role="bulkTag"]').should('be.visible');
        cy.get('li[data-sel-role="export"]').should('not.exist');
    });

    it('exports a selection as CSV, with an added column in the chosen order', () => {
        visitAndSelect();
        openExport();
        cy.get('#export-format-jahia').should('be.disabled');
        cy.get('#export-format-csv').should('be.checked');
        cy.get('[data-cm-role="export-column"][data-cm-column="std:path"] input').check({force: true});
        cy.get('[data-cm-role="export-button"]').should('not.be.disabled').click();
        cy.get('[data-cm-role="export-options"]').should('not.exist');

        cy.readFile(`${downloads}/export-${today()}.csv`, {timeout: 20000}).should(csv => {
            const lines = csv.replace(/^\uFEFF/, '').trim().split(/\r\n/);
            expect(lines).to.have.length(3);
            expect(lines[0].split(',')[0]).to.equal('Name');
            expect(lines[0].split(',').pop()).to.equal('Path');
            expect(lines.slice(1).map(line => line.split(',').pop()).sort())
                .to.deep.equal(names.map(name => `/sites/${siteKey}/contents/${name}`));
        });
    });

    it('exports a selection as JSON', () => {
        visitAndSelect();
        openExport();
        cy.get('#export-format-json').check({force: true});
        cy.get('[data-cm-role="export-button"]').should('not.be.disabled').click();

        cy.readFile(`${downloads}/export-${today()}.json`, {timeout: 20000}).should(rows => {
            expect(rows).to.have.length(2);
            expect(rows[0]).to.have.property('Name');
            expect(rows[0]).to.have.property('Content type', 'jnt:bigText');
        });
    });

    it('still offers the Jahia export for one item', () => {
        const jcontent = JContent.visit(siteKey, 'en', 'content-folders/contents').switchToListMode();
        jcontent.getTable().getRowByName(names[0]).contextMenu().select('Export');
        cy.get('#export-format-jahia').should('be.checked');
        cy.get('[data-cm-role="select-workspace"]').should('be.visible');
        cy.get('[data-cm-role="export-as-xml"]').should('be.visible');
    });
});
