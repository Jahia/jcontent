import {addNode, createSite, deleteSite, enableModule, getComponent, getComponentBySelector, Menu} from '@jahia/cypress';
import gql from 'graphql-tag';
import {ContentEditor, JContent, JContentPageBuilder} from '../../page-object';
import {DeleteDialog} from '../../page-object/deleteDialog';

const setShowPageBuilder = (value: boolean) => cy.apollo({
    mutation: gql`mutation {
        admin {
            jahia {
                configuration(pid: "org.jahia.modules.jcontent") {
                    value(name: "showPageBuilder", value: "${value}")
                }
            }
        }
    }`
});

/**
 * [cent:visuallyEditable] > jnt:content, jmix:visuallyEditable, jmix:basicContent, jmix:editorialContent, jmix:visibleInContentTree, mix:title
 *  + * (cent:childObject1)
 *
 * A node of that type in a content folder has no page: the Page Builder renders it through the content-template
 * wrapper of the default module. A plain jnt:text beside it does not open in the Page Builder.
 *
 * Needs Jahia 8.2.4.0 or later, the first core that ships jmix:visuallyEditable. On an older core the CND of
 * jcontent-test-module does not install, which fails every spec that deploys the module.
 */
describe('Page builder - visually editable content in a content folder', () => {
    const siteKey = 'visuallyEditableSite';
    const contentsPath = `/sites/${siteKey}/contents`;
    const nodeName = 'visually-editable';
    const nodePath = `${contentsPath}/${nodeName}`;
    const childPath = `${nodePath}/child-a`;
    const plainName = 'plain-text';

    // The view an editor last chose on such an item, which jContent keeps in the browser
    const viewModeKey = 'jcontent-pageBuilderContent-viewMode';
    const visitWithNoChosenView = (path: string): JContent => JContent.visit(siteKey, 'en', path, {
        onBeforeLoad: (win: Window) => win.localStorage.removeItem(viewModeKey)
    });

    const visitNode = (): JContentPageBuilder => JContent
        .visit(siteKey, 'en', `content-folders/contents/${nodeName}`)
        .switchToPageBuilder();

    // Open in Page Builder sits in the header menu, which the narrow header shows at a width of 750px or less
    const openHeaderMenu = (): Menu => {
        cy.get('button[data-sel-role="narrowHeaderMenu"]').should('be.visible').click();
        const menu = getComponentBySelector(Menu, '#menuHolder .moonstone-menu:not(.moonstone-hidden)');
        menu.shouldHaveItem('Delete');
        return menu;
    };

    const frameShouldHaveExistingNodes = (count: number) => {
        cy.get('iframe[data-sel-role="page-builder-frame-active"]').should($frame => {
            expect($frame.contents().find(`[jahiatype="module"][type="existingNode"][path^="${nodePath}/"]`)).to.have.length(count);
        });
    };

    before(() => {
        setShowPageBuilder(true);
        createSite(siteKey);
        enableModule('jcontent-test-module', siteKey);
        addNode({
            parentPathOrId: contentsPath,
            name: nodeName,
            primaryNodeType: 'cent:visuallyEditable',
            properties: [{name: 'jcr:title', value: 'Visually editable', language: 'en'}],
            children: [{name: 'child-a', primaryNodeType: 'cent:childObject1'}]
        });
        addNode({
            parentPathOrId: contentsPath,
            name: plainName,
            primaryNodeType: 'jnt:text',
            properties: [{name: 'text', value: 'Plain text', language: 'en'}]
        });
    });

    after(() => {
        setShowPageBuilder(true);
        deleteSite(siteKey);
    });

    beforeEach(() => {
        cy.loginAndStoreSession();
    });

    it('Case 1: offers the Page Builder to the visually editable content only', () => {
        cy.viewport(1080, 768);
        const jcontent = visitWithNoChosenView(`content-folders/contents/${plainName}`);
        const plainMenu = openHeaderMenu();
        plainMenu.shouldNotHaveItem('Open in Page Builder');
        plainMenu.close();

        // Selecting it opens it in the Page Builder by default, and its list view offers the way back
        jcontent.getAccordionItem('content-folders').getTreeItem(nodeName).click();
        jcontent.shouldBeInMode('Page Builder');
        new JContentPageBuilder(jcontent).getMainModule(nodePath);
        jcontent.switchToListMode();
        openHeaderMenu().shouldHaveItem('Open in Page Builder');
    });

    it('keeps the view the editor chose on such an item', () => {
        const jcontent = visitWithNoChosenView(`content-folders/contents/${nodeName}`);
        jcontent.shouldBeInMode('Page Builder');
        jcontent.switchToListMode();
        jcontent.getAccordionItem('content-folders').getTreeItem('contents').click();
        jcontent.getTable().getRowByName(nodeName).should('be.visible');
        jcontent.getAccordionItem('content-folders').getTreeItem(nodeName).click();
        jcontent.shouldBeInMode('List');
        jcontent.getTable().getRowByName('child-a').should('be.visible');
    });

    it('does not keep a view chosen on a folder', () => {
        const jcontent = visitWithNoChosenView('content-folders/contents');
        jcontent.switchToStructuredView();
        jcontent.getAccordionItem('content-folders').getTreeItem(nodeName).click();
        jcontent.shouldBeInMode('Page Builder');
    });

    it('Case 2: renders the content alone in the frame through the content-template wrapper', () => {
        const pageBuilder = visitNode();
        pageBuilder.getMainModule(nodePath);
        cy.url().should('contain', 'template:content-template');
        cy.get('iframe[data-sel-role="page-builder-frame-active"]')
            .its('0.contentWindow.location.pathname')
            .should('match', /\.content-template\.html$/);
        // One box for the content itself, with the insertion point of its children
        pageBuilder.getModule(nodePath, false).getCreateButtons().get().should('exist');
        frameShouldHaveExistingNodes(1);
    });

    it('Case 3: creates and deletes a child through the frame', () => {
        const pageBuilder = visitNode();
        pageBuilder.iframe(true).get().find('[jahiatype="createbuttons"] button[data-sel-role="cent:childObject1"]').first().click({force: true});
        new ContentEditor().create();
        frameShouldHaveExistingNodes(2);

        pageBuilder.getModule(childPath, false).contextMenu(true, false).select('Delete');
        getComponent(DeleteDialog).markForDeletion();
        pageBuilder.getModule(childPath).getForDeletionStatus().should('be.visible');
        cy.url().should('contain', 'template:content-template');
    });

    it('Case 4: offers no preview or live page of its own', () => {
        const jcontent = JContent.visit(siteKey, 'en', 'content-folders/contents');
        jcontent.switchToListMode();
        const menu = jcontent.getTable().getRowByName(nodeName).contextMenu();
        menu.shouldHaveItem('Edit');
        menu.shouldNotHaveRoleItem('openInPreviewMenu');
        menu.close();
    });

    it('Case 5: keeps a page on its own template', () => {
        JContent.visit(siteKey, 'en', 'pages/home').switchToPageBuilder().getMainModule(`/sites/${siteKey}/home`);
        cy.url().should('not.contain', 'template:content-template');
        cy.get('iframe[data-sel-role="page-builder-frame-active"]')
            .its('0.contentWindow.location.pathname')
            .should('not.contain', 'content-template');
    });

    it('Case 6: offers no Page Builder when showPageBuilder is false', () => {
        setShowPageBuilder(false);
        const jcontent = JContent.visit(siteKey, 'en', `content-folders/contents/${nodeName}`);
        jcontent.shouldBeInMode('List');
        cy.get('[data-sel-role="sel-view-mode-pageBuilder"]').should('not.exist');

        JContent.visit(siteKey, 'en', 'content-folders/contents').getTable().getRowByName(nodeName)
            .contextMenu().shouldNotHaveItem('Open in Page Builder');
    });
});
