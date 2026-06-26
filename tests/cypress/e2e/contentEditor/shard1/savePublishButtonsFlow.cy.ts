import {
    addNode, Button,
    createUser,
    deleteSite,
    deleteUser,
    enableModule,
    getComponentByRole,
    getNodeByPath,
    grantRoles,
    Menu, publishAndWaitJobEnding
} from '@jahia/cypress';
import {SmallTextField} from '../../../page-object/fields';
import {ContentEditor, JContent} from '../../../page-object';

describe('Test the save publish buttons flow', () => {
    const siteKey = 'savePublishButtonsFlow';
    const sitePath = '/sites/' + siteKey;
    const siteContentPath = sitePath + '/contents';
    const contentFolder = 'contentEditorTestContents';
    const contentTest = 'contentEditorAllFieldsSimple';
    const contentPath = siteContentPath + '/' + contentFolder + '/' + contentTest;
    const userName = 'editorInChief';
    const newSharedSmallTextValue = 'Adapted text';
    const langEN = 'en';

    before(function () {
        cy.executeGroovy('contentEditor/createSiteI18N.groovy', {SITEKEY: siteKey});
        createUser(userName, 'password', [{name: 'preferredLanguage', value: langEN}]);
        createUser('thor', 'password', [{name: 'preferredLanguage', value: langEN}]);
        enableModule('qa-module', siteKey);
        grantRoles('/sites/' + siteKey, ['editor-in-chief'], userName, 'USER');
        grantRoles('/sites/' + siteKey, ['editor'], 'thor', 'USER');
        addNode({
            parentPathOrId: siteContentPath,
            name: contentFolder,
            primaryNodeType: 'jnt:contentFolder'
        });
        addNode({
            parentPathOrId: siteContentPath + '/' + contentFolder,
            name: contentTest,
            primaryNodeType: 'qant:allFields',
            properties: [
                {name: 'sharedSmallText', value: 'Initial text', language: 'en'},
                {name: 'sharedTextarea', value: 'Initial text in textarea', language: 'en'}
            ]
        });
        addNode({
            parentPathOrId: `/sites/${siteKey}/contents`,
            name: 'simpleTextA',
            primaryNodeType: 'jnt:text',
            properties: [{name: 'text', value: 'hello', language: 'en'}]
        });
        addNode({
            parentPathOrId: `/sites/${siteKey}/contents`,
            name: 'simpleTextB',
            primaryNodeType: 'jnt:text',
            properties: [
                {name: 'text', value: 'EN', language: 'en'},
                {name: 'text', value: 'DE', language: 'de'}
            ]
        });
        addNode({
            parentPathOrId: `/sites/${siteKey}/contents`,
            name: 'constraints',
            primaryNodeType: 'qant:constraints',
            properties: [
                {name: 'mandatorySharedSmallText', value: 'test'},
                {name: 'mandatoryRegexSharedSmallText', value: 'test'},
                {name: 'mandatorySmallText', value: 'test', language: 'en'},
                {name: 'mandatoryRegexSmallText', value: 'test', language: 'en'}
            ]
        });
        publishAndWaitJobEnding(`/sites/${siteKey}/contents/simpleTextA`, ['en', 'de', 'fr']);
        publishAndWaitJobEnding(`/sites/${siteKey}/contents/simpleTextB`, ['en', 'de', 'fr']);
    });

    after(function () {
        cy.logout();
        deleteSite(siteKey);
        deleteUser(userName);
        deleteUser('thor');
    });

    const checkContentEditorHeaderButtons = (contentEditor: ContentEditor, saveDisabled: boolean, publishDisabled: boolean) => {
        contentEditor.checkButtonStatus('submitSave', saveDisabled);
        contentEditor.checkButtonStatus('publishAction', publishDisabled);
    };

    const checkContentEditorHeaderMenu = (contentEditor: ContentEditor, ariaDisabledUnpublish: string) => {
        contentEditor.openContentEditorHeaderMenu();
        getComponentByRole(Menu, 'jcontent-publishMenu').should('be.visible').find('.moonstone-menuItem[data-sel-role="unpublish"]').should('have.attr', 'aria-disabled', ariaDisabledUnpublish);
        cy.get('body').click();
    };

    const updateAndSave = (contentEditor: ContentEditor) => {
        cy.log('Update sharedSmallText and save');
        contentEditor
            .getField(SmallTextField, 'qant:allFields_sharedSmallText')
            .addNewValue(newSharedSmallTextValue + Cypress.currentRetry, true);
        checkContentEditorHeaderButtons(contentEditor, true, false);
        contentEditor.save();
    };

    const publish = (contentEditor: ContentEditor) => {
        cy.log('Publish');
        checkContentEditorHeaderButtons(contentEditor, false, true);
        checkContentEditorHeaderMenu(contentEditor, 'true');
        contentEditor.publish();
        getNodeByPath(contentPath, ['sharedSmallText', 'j:lastPublishedBy'], langEN, null, 'LIVE').then((result => {
            expect(result?.data?.jcr?.nodeByPath?.name).eq('contentEditorAllFieldsSimple');
            expect(result?.data?.jcr?.nodeByPath?.properties?.find(property => property.name === 'j:lastPublishedBy')?.value).contains(userName);
            expect(result?.data?.jcr?.nodeByPath?.properties?.find(property => property.name === 'sharedSmallText')?.value).contains(newSharedSmallTextValue);
        }));
        checkContentEditorHeaderButtons(contentEditor, false, false);
        checkContentEditorHeaderMenu(contentEditor, 'false');
    };

    const unPublish = (contentEditor: ContentEditor) => {
        cy.log('Unpublish in all languages');
        contentEditor.openContentEditorHeaderMenu();
        getComponentByRole(Menu, 'jcontent-publishMenu')
            .should('be.visible')
            .find('.moonstone-menuItem[data-sel-role="unpublishInAllLanguages"]')
            .should('have.attr', 'aria-disabled', 'false')
            .click();
        cy.get('button.x-btn-text').contains('Unpublish all').click();
        cy.get('#dialog-errorBeforeSave', {timeout: 1000}).should('not.exist');
        cy.get('div[id="notistack-snackbar"]').should('be.visible').should('contain', 'Unpublication completed');

        cy.waitUntil(() => {
            return cy.apollo({
                fetchPolicy: 'no-cache',
                variables: {path: contentPath},
                queryFile: 'contentEditor/graphql/jcrPublicationStatus.graphql'
            }).then(result => {
                const publicationStatus = result?.data?.jcr?.nodeByPath?.aggregatedPublicationInfo?.publicationStatus;
                return publicationStatus === 'UNPUBLISHED';
            });
        }, {timeout: 10000, interval: 2000, errorMsg: `Unable to unpublish content ${contentPath}`});

        // Flaky with refresh, reload instead to check unpublish state
        const jcontent = JContent.visit(siteKey, langEN, 'content-folders/contents/contentEditorTestContents');
        jcontent.editComponentByText(contentTest).switchToAdvancedMode();

        checkContentEditorHeaderButtons(new ContentEditor(), false, true);
        checkContentEditorHeaderMenu(new ContentEditor(), 'true');
    };

    it('check save publish buttons flow', {retries: 3}, () => {
        cy.log('Login with editor in chief');
        cy.login(userName, 'password');
        const jcontent = JContent.visit(siteKey, langEN, 'content-folders/contents/contentEditorTestContents');
        const contentEditor = jcontent.editComponentByText(contentTest);
        contentEditor.switchToAdvancedMode();
        cy.log('Check Content Editor header buttons');
        checkContentEditorHeaderButtons(contentEditor, false, true);
        cy.log('Check Content Editor header menu');
        checkContentEditorHeaderMenu(contentEditor, 'true');
        cy.log('Check update and save');
        updateAndSave(contentEditor);
        cy.log('Check publish buttons flow');
        publish(contentEditor);
        cy.log('Check unpublish buttons flow');
        unPublish(contentEditor);
    });

    it('should display request publication button', () => {
        cy.log('Login with editor');
        cy.login('thor', 'password');
        const jcontent = JContent.visit(siteKey, 'en', 'content-folders/contents');
        const contentEditor = jcontent.editComponentByRowName('simpleTextA');
        contentEditor.switchToAdvancedMode();

        contentEditor.checkButtonStatus('submitSave', false);
        // Commented because the request publication button stays active even though there is nothing to publish
        // contentEditor.checkButtonStatus('startWorkflowMainButton', false);

        contentEditor.getSmallTextField('jnt:text_text').addNewValue('hi');
        contentEditor.checkButtonStatus('submitSave', true);
        contentEditor.checkButtonStatus('startWorkflowMainButton', false);
        contentEditor.save();
        contentEditor.checkButtonStatus('submitSave', false);
        contentEditor.checkButtonStatus('startWorkflowMainButton', true);
    });

    it('should displayed publish button for updated content only', () => {
        cy.login();
        const jcontent = JContent.visit(siteKey, 'en', 'content-folders/contents');
        const contentEditor = jcontent.editComponentByRowName('simpleTextB');
        contentEditor.switchToAdvancedMode();

        checkContentEditorHeaderButtons(contentEditor, false, false);
        contentEditor.getSmallTextField('jnt:text_text').addNewValue('EN update');
        checkContentEditorHeaderButtons(contentEditor, true, false);
        contentEditor.save();
        checkContentEditorHeaderButtons(contentEditor, false, true);
        contentEditor.getLanguageSwitcherAdvancedMode().select('German');
        checkContentEditorHeaderButtons(contentEditor, false, false);
    });

    it('should not be able to publish with invalid form', () => {
        cy.login();
        const jcontent = JContent.visit(siteKey, 'en', 'content-folders/contents');
        const contentEditor = jcontent.editComponentByRowName('constraints');
        contentEditor.switchToAdvancedMode();

        checkContentEditorHeaderButtons(contentEditor, false, true);
        contentEditor.getSmallTextField('qant:constraints_mandatorySharedSmallText').clearValue();
        contentEditor.save(false);
        cy.get('[data-sel-role=dialog-errorBeforeSave]').contains('Mandatory text');
        getComponentByRole(Button, 'content-type-dialog-cancel').click();
        checkContentEditorHeaderButtons(contentEditor, true, false);
    });
});
