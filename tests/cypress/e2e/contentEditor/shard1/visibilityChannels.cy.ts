import {JContent} from '../../../page-object';
import {MultipleLeftRightField} from '../../../page-object/fields/multipleLeftRightField';
import {createSite, deleteSite, enableModule, getComponentByAttr, getComponentByRole, Button, getNodeByPath} from '@jahia/cypress';

const siteKey = 'visibilityChannelsSite';
const contentPath = `/sites/${siteKey}/home/area-main/test-content1`;
const channelsFieldSet = 'jmix:channelSelection';
const devicesField = 'jmix:channelSelection_j:channelSelection';

const openVisibilityDialog = () => getComponentByRole(Button, 'sbsVisibility').click();
const getChannelsBlock = () => cy.get('[data-sel-role="edit-visibility-rules-dialog"] [data-sel-role="visibility-channels"]');
const getChannelsSwitch = () => cy.get(`[data-sel-role-dynamic-fieldset="${channelsFieldSet}"]`);
const closeVisibilityDialog = () => cy.get('[data-sel-role="edit-visibility-rules-dialog"]').contains('button', 'Close').click();

describe('Visibility Screen - Channels', () => {
    let jcontent: JContent;

    before(() => {
        createSite(siteKey, {
            languages: 'en',
            templateSet: 'dx-base-demo-templates',
            serverName: 'localhost',
            locale: 'en'
        });
        enableModule('channels', siteKey);
        cy.apollo({
            mutationFile: 'jcontent/createContent.graphql',
            variables: {homePath: `/sites/${siteKey}/home`}
        });
    });

    after(() => {
        deleteSite(siteKey);
        cy.logout();
    });

    beforeEach(() => {
        cy.loginAndStoreSession();
        jcontent = JContent.visit(siteKey, 'en', 'pages/home');
        jcontent.switchToListMode().editComponentByRowName('test-content1');
    });

    it('Saves the devices of a content from the visibility dialog', () => {
        openVisibilityDialog();
        getChannelsBlock().should('be.visible').and('contain', 'Devices');
        getComponentByRole(Button, 'channels-save-button').should('be.disabled');

        getChannelsSwitch().click();
        getComponentByAttr(MultipleLeftRightField, 'data-sel-content-editor-field', devicesField)
            .addNewValue('Tablet: iPad');
        getComponentByRole(Button, 'channels-save-button').should('not.be.disabled').click();
        getComponentByRole(Button, 'channels-save-button').should('be.disabled');

        getNodeByPath(contentPath, ['j:channelSelection', 'j:channelIncludeOrExclude']).then(res => {
            const properties = res.data.jcr.nodeByPath.properties;
            expect(properties.find(p => p.name === 'j:channelSelection').values).to.deep.eq(['apple_ipad_ver1']);
            expect(properties.find(p => p.name === 'j:channelIncludeOrExclude').value).to.eq('include');
        });
        closeVisibilityDialog();
    });

    it('Shows the saved devices when the dialog opens again', () => {
        openVisibilityDialog();
        getChannelsSwitch().find('input').should('be.checked');
        getComponentByAttr(MultipleLeftRightField, 'data-sel-content-editor-field', devicesField)
            .get().find('li[role="right-list"]').should('contain', 'Tablet: iPad');

        // Switching channels off removes the mixin and its properties
        getChannelsSwitch().click();
        getComponentByRole(Button, 'channels-save-button').click();
        getComponentByRole(Button, 'channels-save-button').should('be.disabled');
        getNodeByPath(contentPath, ['j:channelSelection']).then(res => {
            expect(res.data.jcr.nodeByPath.properties).to.have.length(0);
        });
        closeVisibilityDialog();
    });
});
