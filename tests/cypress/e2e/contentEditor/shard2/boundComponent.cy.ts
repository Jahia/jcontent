import {JContent, JContentPageBuilder} from '../../../page-object';
import { addNode, deleteSite, enableModule, setNodeProperty } from '@jahia/cypress'

describe('Bound component tests', () => {
    const siteKey = 'boundComponentSite';

    before(() => {
        cy.executeGroovy('contentEditor/createSite.groovy', {SITEKEY: siteKey});
        enableModule('jcontent-test-module', siteKey);
    });

    after(() => {
        deleteSite(siteKey);
    });

    beforeEach(() => {
        cy.loginAndStoreSession();
    });

    after(() => {
        cy.logout();
    });

    it('Bound component can be added via content editor', () => {
        const jcontent = JContent.visit(siteKey, 'en', 'content-folders/contents')
        jcontent.switchToListMode();
        const contentEditor = jcontent.createContent('cent:boundComponent');
        const picker = contentEditor.getPickerField('jmix:bindedComponent_j:bindedComponent').open();
        picker.getAccordionItem('picker-pages').getTreeItem('home').click();
        picker.getTable().getRowByName('search-results').should('be.visible').click();
        picker.select();
        contentEditor.create();

        const boundComponent = jcontent.getTable().getRowByName('boundcomponent');
        boundComponent.contextMenu().select('edit');

        const pickerField = contentEditor.getPickerField('jmix:bindedComponent_j:bindedComponent');
        pickerField.assertValue('Search Results');
    });

    it('Shows empty content overlay in page builder when bound rich text is empty, then displays content after editing', () => {
        const homePath = `/sites/${siteKey}/home`;
        const contentsPath = `/sites/${siteKey}/contents`;
        const richTextName = 'bound-rich-text';
        const boundComponentName = 'bound-component-test';
        const boundComponentPath = `${homePath}/area-main/${boundComponentName}`;

        // Create an empty rich text in site contents, then create the bound component referencing it
        addNode({
            parentPathOrId: contentsPath,
            name: richTextName,
            primaryNodeType: 'jnt:bigText'
        }).then(result => {
            const richTextUuid = result?.data?.jcr?.addNode?.uuid;
            addNode({
                parentPathOrId: homePath,
                name: 'area-main',
                primaryNodeType: 'jnt:contentList',
                mixins: ['jmix:isAreaList'],
                children: [{
                    name: boundComponentName,
                    primaryNodeType: 'cent:boundComponent',
                    properties: [{
                        name: 'j:bindedComponent',
                        type: 'WEAKREFERENCE',
                        value: richTextUuid,
                        language: 'en'
                    }]
                }]
            });
        });

        // Open page builder — the empty bound component should show the "Nothing to display" overlay
        cy.log('Empty bound component should have "Nothing to display" overlay');
        let pageBuilder: JContentPageBuilder = JContent
            .visit(siteKey, 'en', 'pages/home')
            .switchToPageBuilder();

        pageBuilder.getModule(boundComponentPath).getBox().assertHasEmptyOverlay();

        cy.log('Add text to binded component - bound component should now display rich text content');
        setNodeProperty(`${contentsPath}/${richTextName}`, 'text', '<p>Hello bound world</p>', 'en');
        pageBuilder = JContent.visit(siteKey, 'en', 'pages/home').switchToPageBuilder();
        pageBuilder.getModule(boundComponentPath).get().should('contain', 'Hello bound world');
    });
});
