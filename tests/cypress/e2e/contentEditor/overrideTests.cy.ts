import {ContentEditor, JContent} from '../../page-object';
import {RichTextField} from '../../page-object/fields';
import {Button, getComponentByRole} from '@jahia/cypress';

describe('overrideTests', {testIsolation: false}, () => {
    let jcontent: JContent;

    before(() => {
        cy.executeGroovy('contentEditor/createSite.groovy', {SITEKEY: 'contentEditorSite'});
        cy.apollo({mutationFile: 'contentEditor/references.graphql'});

        const fileName = 'contentEditor/overrideTests/modules/jcontent-helper-no-bigText.jar';
        // Need to wait explicitly for the bundle listener to process event
        // eslint-disable-next-line
        cy.runProvisioningScript({ fileContent: '- installAndStartBundle: "' + fileName + '"', type: 'application/yaml' },
            [{fileName: fileName, type: 'application/java-archive'}]
        )
            .then(res => {
                expect(res.length).to.equal(1);
                expect(res[0].start[0].message).to.equal('Operation successful');
            })
            .wait(3000);

        cy.loginAndStoreSession();
    });

    after(() => {
        cy.executeGroovy('contentEditor/deleteSite.groovy', {SITEKEY: 'contentEditorSite'});
    });

    it('Can show and hide advancedMode button with json override', function () {
        // Deploy jcontent-helper on site
        cy.apollo({
            mutationFile: 'contentEditor/overrideTests/deployModule.graphql'
        });

        jcontent = JContent.visit('contentEditorSite', 'en', 'content-folders/contents');
        jcontent.getTable().getRowByLabel('Rich text').contextMenu().select('Edit');
        cy.get('button[data-sel-role="advancedMode"]').should('not.exist');

        cy.apollo({
            mutationFile: 'contentEditor/overrideTests/undeployModule.graphql'
        });

        jcontent = JContent.visit('contentEditorSite', 'en', 'content-folders/contents');
        jcontent.getTable().getRowByLabel('Rich text').contextMenu().select('Edit');
        cy.get('button[data-sel-role="advancedMode"]').should('exist');
    });
});

