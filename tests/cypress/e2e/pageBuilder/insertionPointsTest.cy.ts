import {addNode, createSite, deleteSite, enableModule, getComponent, getComponentBySelector, Menu} from '@jahia/cypress';
import gql from 'graphql-tag';
import {ContentEditor, ContentTypeSelector, JContent} from '../../page-object';

const setButtonLimit = (value: string) => {
    return cy.apollo({
        mutation: gql`mutation {
            admin {
                jahia {
                    configuration(pid: "org.jahia.modules.jcontent") {
                        value(name: "createChildrenDirectButtons.limit", value: "${value}")
                    }
                }
            }
        }`
    });
};

const assertButtonByRole = (pageBuilder, role: string) => {
    pageBuilder.iframe().get().find(`button[data-sel-role="${role}"]`).should('be.visible');
};

const clickButtonByRole = (pageBuilder, role: string) => {
    pageBuilder.iframe().get().find(`button[data-sel-role="${role}"]`).should('be.visible').click();
};

/**
 *  [cent:twoChildObjectsOneMultiple] > jnt:content, jmix:basicContent, jmix:editorialContent
 *   - someProperty (string)
 *   + childObject1 (cent:childObject1)
 *   + childObject2 (cent:childObject2)
 *   + * (cent:childObject3)
 *
 *  [cent:sixChildObjectsSingle] > jnt:content, jmix:basicContent, jmix:editorialContent
 *   - someProperty (string)
 *   + childObject1 (cent:childObject1)
 *   + childObject2 (cent:childObject2)
 *   + childObject3 (cent:childObject3)
 *   + childObject4 (cent:childObject4)
 *   + childObject5 (cent:childObject5)
 *   + childObject6 (cent:childObject6)
 *
 *  [cent:sixChildObjectsMultiple] > jnt:content, jmix:basicContent, jmix:editorialContent
 *   - someProperty (string)
 *   + * (cent:childObject1)
 *   + * (cent:childObject2)
 *   + * (cent:childObject3)
 *   + * (cent:childObject4)
 *   + * (cent:childObject5)
 *   + * (cent:childObject6)
 *
 *   Note on functionality:
 *
 *   Given the definitions above and a child limit of > 6 it is expected that:
 *
 *   [cent:twoChildObjectsOneMultiple] will show 3 buttons: childObject1, childObject2, childObject3
 *   where only childObject3 can be used multiple times the other two disapper once used.
 *
 *   [cent:sixChildObjectsSingle] will show 6 buttons respectivaly named and all single use.
 *
 *   [cent:sixChildObjectsMultiple] will show 6 multiple use buttons.
 *
 *   When the module which contains the definition is clicked and a child element exist (created using one of the buttons) then
 *   additional buttons (all + * types) will be added on top of that module IN ADDITION to all currently available buttons.
 *
 *   When the limit is < 6 then all single use buttons are expected to be shown and all buttons that fall into multiple category will be
 *   replaced by one "New content" button which will show content type selector LIMITED to available types, in this case six types.
 *
 *   Below are some possible renderings that can happen depending on the definition.
 *
 *   Definition of multiple children of types a and b
 *   <div id="moduleABC" jahiatype="module" nodetypes="a b">
 *        <div type="placeholder" path="*"/>
 *   </div>
 *
 *   Definition of a single named child a and multiple children of type b
 *   <div id="moduleABC" jahiatype="module" nodetypes="b">
 *       <div type="placeholder" path="childName" nodetypes="a"/>
 *       <div type="placeholder" path="*"/>
 *   </div>
 *
 *   If named child is added the placehoder will be replaced by <div type="existingNode" />. This is true for all named children.
 *
 *   Definition of multiple named children of type a and b (it could also be just one child). Note that the parent no longer has nodetypes.
 *   <div id="moduleABC" jahiatype="module">
 *       <div type="placeholder" path="childName" nodetypes="a"/>
 *       <div type="placeholder" path="childName" nodetypes="b"/>
 *   </div>
 *
 */
describe('Page builder - insertion points', () => {
    const siteKey = 'insertionPointsSite';
    const homePath = `/sites/${siteKey}/home`;

    before(() => {
        createSite(siteKey, {
            templateSet: 'dx-base-demo-templates',
            serverName: 'localhost',
            locale: 'en'
        });
        enableModule('jcontent-test-module', siteKey);

        // Set limit to 8 so all child types show individual buttons
        setButtonLimit('8');

        // Page with cent:twoChildObjectsOneMultiple
        addNode({
            name: 'page-two-one-multiple',
            parentPathOrId: homePath,
            primaryNodeType: 'jnt:page',
            properties: [
                {name: 'jcr:title', value: 'Two Child Objects One Multiple', language: 'en'},
                {name: 'j:templateName', value: 'simple'}
            ],
            children: [{
                name: 'area-main',
                primaryNodeType: 'jnt:contentList',
                mixins: ['jmix:isAreaList'],
                children: [{
                    name: 'test-two-one-multiple',
                    primaryNodeType: 'cent:twoChildObjectsOneMultiple'
                }]
            }]
        });

        // Page with cent:sixChildObjectsSingle
        addNode({
            name: 'page-six-single',
            parentPathOrId: homePath,
            primaryNodeType: 'jnt:page',
            properties: [
                {name: 'jcr:title', value: 'Six Child Objects Single', language: 'en'},
                {name: 'j:templateName', value: 'simple'}
            ],
            children: [{
                name: 'area-main',
                primaryNodeType: 'jnt:contentList',
                mixins: ['jmix:isAreaList'],
                children: [{
                    name: 'test-six-single',
                    primaryNodeType: 'cent:sixChildObjectsSingle'
                }]
            }]
        });

        // Page with cent:sixChildObjectsMultiple
        addNode({
            name: 'page-six-multiple',
            parentPathOrId: homePath,
            primaryNodeType: 'jnt:page',
            properties: [
                {name: 'jcr:title', value: 'Six Child Objects Multiple', language: 'en'},
                {name: 'j:templateName', value: 'simple'}
            ],
            children: [{
                name: 'area-main',
                primaryNodeType: 'jnt:contentList',
                mixins: ['jmix:isAreaList'],
                children: [{
                    name: 'test-six-multiple',
                    primaryNodeType: 'cent:sixChildObjectsMultiple'
                }]
            }]
        });

        // Page with cent:oneChildMultipleList
        addNode({
            name: 'page-one-child-list',
            parentPathOrId: homePath,
            primaryNodeType: 'jnt:page',
            properties: [
                {name: 'jcr:title', value: 'One Child Multiple List', language: 'en'},
                {name: 'j:templateName', value: 'simple'}
            ],
            children: [{
                name: 'area-main',
                primaryNodeType: 'jnt:contentList',
                mixins: ['jmix:isAreaList'],
                children: [{
                    name: 'test-one-child-list',
                    primaryNodeType: 'cent:oneChildMultipleList'
                }]
            }]
        });
    });

    after(() => {
        // Reset limit back to default
        setButtonLimit('5');
        deleteSite(siteKey);
    });

    beforeEach(() => {
        cy.loginAndStoreSession();
    });

    it('shows correct create buttons for twoChildObjectsOneMultiple', () => {
        const pageBuilder = JContent
            .visit(siteKey, 'en', 'pages/home/page-two-one-multiple')
            .switchToPageBuilder();

        assertButtonByRole(pageBuilder, 'cent:childObject1');
        assertButtonByRole(pageBuilder, 'cent:childObject2');
        assertButtonByRole(pageBuilder, 'cent:childObject3');
    });

    it('shows correct create buttons for sixChildObjectsSingle', () => {
        const pageBuilder = JContent
            .visit(siteKey, 'en', 'pages/home/page-six-single')
            .switchToPageBuilder();

        for (let i = 1; i <= 6; i++) {
            assertButtonByRole(pageBuilder, `cent:childObject${i}`);
        }
    });

    it('shows correct create buttons for sixChildObjectsMultiple and verifies insertion points after create', () => {
        const modulePath = `${homePath}/page-six-multiple/area-main/test-six-multiple`;
        let pageBuilder = JContent
            .visit(siteKey, 'en', 'pages/home/page-six-multiple')
            .switchToPageBuilder();

        for (let i = 1; i <= 6; i++) {
            assertButtonByRole(pageBuilder, `cent:childObject${i}`);
        }

        clickButtonByRole(pageBuilder, 'cent:childObject1');
        const contentEditor = new ContentEditor();
        contentEditor.create();

        // Renavigate to refresh module state
        pageBuilder = JContent
            .visit(siteKey, 'en', 'pages/home/page-six-multiple')
            .switchToPageBuilder();

        const updatedModule = pageBuilder.getModule(modulePath, false);
        updatedModule.get().scrollIntoView();
        updatedModule.get().click('bottomLeft', {force: true});

        for (let i = 1; i <= 6; i++) {
            assertButtonByRole(pageBuilder, `cent:childObject${i}`);
        }
    });

    it('sixChildObjectsSingle still shows six buttons while sixChildObjectsMultiple collapses to one when limit is 5', () => {
        setButtonLimit('5');

        const singlePageBuilder = JContent
            .visit(siteKey, 'en', 'pages/home/page-six-single')
            .switchToPageBuilder();

        for (let i = 1; i <= 6; i++) {
            assertButtonByRole(singlePageBuilder, `cent:childObject${i}`);
        }

        const multiplePageBuilder = JContent
            .visit(siteKey, 'en', 'pages/home/page-six-multiple')
            .switchToPageBuilder();

        const multipleModule = multiplePageBuilder.getModule(`${homePath}/page-six-multiple/area-main/test-six-multiple`);
        const multipleButtons = multipleModule.getCreateButtons();
        multipleButtons.get().scrollIntoView();
        multipleButtons.getButton('New content').click();

        const contentTypeDialog = 'div[aria-labelledby="dialog-createNewContent"]';
        cy.get(contentTypeDialog).should('be.visible');
        for (let i = 1; i <= 6; i++) {
            cy.get(contentTypeDialog)
                .find(`[data-sel-role="content-type-tree-item"][data-sel-content-type="cent:childObject${i}"]`)
                .should('exist');
        }

        cy.get(contentTypeDialog)
            .find('[data-sel-role="content-type-tree-item"]')
            .should('have.length', 6);
    });

    it('shows correct buttons for oneChildMultipleList and verifies context menu', () => {
        const modulePath = `${homePath}/page-one-child-list/area-main/test-one-child-list`;
        const pageBuilder = JContent
            .visit(siteKey, 'en', 'pages/home/page-one-child-list')
            .switchToPageBuilder();

        // Should show both "New childObject1" (typed button) and "New content" (generic)
        assertButtonByRole(pageBuilder, 'cent:childObject1');
        assertButtonByRole(pageBuilder, 'createContent');

        // Click on the module to select it and show header
        const module = pageBuilder.getModule(modulePath, false);
        module.get().scrollIntoView();
        module.get().click('bottomLeft', {force: true});

        assertButtonByRole(pageBuilder, 'cent:childObject1');
        assertButtonByRole(pageBuilder, 'createContent');

        // Open the three-dot menu from the header
        const header = module.getBox().getHeader();
        header.getButton('contentItemActionsMenu').click();

        // Verify "New content" exists in the context menu and click it
        const menu = getComponentBySelector(Menu, '#menuHolder .moonstone-menu:not(.moonstone-hidden)');
        menu.selectByRole('createContent');

        const selector = getComponent(ContentTypeSelector);
        const ce = selector.searchForContentType('cent:childObject1').selectContentType('cent:childObject1').create();
        ce.cancel();
    });
});

