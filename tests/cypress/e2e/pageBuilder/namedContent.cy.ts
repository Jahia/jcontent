import {addNode, context, createSite, deleteSite, enableModule, jfaker} from '@jahia/cypress';
import {ContentEditor, JContent, JContentPageBuilder} from '../../page-object';

describe('Page builder - named content', () => {
    const siteKey = `namedContentSite${jfaker.string.alphanumeric({length: 8, casing: 'lower', safe: true})}`;
    const pageName = 'namedContentPage';
    // Qa-module defines qant:namedChildNode with the named children namedBigText (jnt:bigText),
    // namedText (jnt:text) and namedChildren (qant:namedChildren), and any number of unnamed jnt:text
    const namedChildNodePath = `/sites/${siteKey}/home/${pageName}/area-main/namedchildnode`;
    // The default system name is unique among its siblings, so this page keeps its area empty
    const emptyPageName = 'emptyAreaPage';
    const emptyAreaPath = `/sites/${siteKey}/home/${emptyPageName}/area-main`;

    const visitPageBuilder = (page = pageName): JContentPageBuilder => JContent
        .visit(siteKey, 'en', `pages/home/${page}`)
        .switchToPageBuilder();

    const openCreateFromPlaceholder = (placeholderPath: string, nodeType: string): ContentEditor => {
        const buttons = visitPageBuilder().getModule(namedChildNodePath, false).getCreateButtons(placeholderPath);
        buttons.get().scrollIntoView();
        buttons.getButtonByRole(nodeType).click();
        return new ContentEditor();
    };

    const assertSystemName = (contentEditor: ContentEditor, systemName: string, isReadOnly: boolean) => {
        const field = contentEditor.getSmallTextField('nt:base_ce:systemName');
        field.checkValue(systemName);
        if (isReadOnly) {
            field.isReadOnly();
        } else {
            field.isNotReadOnly();
        }

        // The copy title button exists only in edit mode
        cy.get('[data-sel-role="syncSystemName"]').should('not.exist');
    };

    before(() => {
        createSite(siteKey, {
            templateSet: 'dx-base-demo-templates',
            serverName: 'localhost',
            locale: 'en'
        });
        enableModule('qa-module', siteKey);
        addNode({
            name: pageName,
            parentPathOrId: `/sites/${siteKey}/home`,
            primaryNodeType: 'jnt:page',
            properties: [
                {name: 'jcr:title', value: 'Named content test page', language: 'en'},
                {name: 'j:templateName', value: 'simple'}
            ],
            children: [{
                name: 'area-main',
                primaryNodeType: 'jnt:contentList',
                mixins: ['jmix:isAreaList'],
                children: [{name: 'namedchildnode', primaryNodeType: 'qant:namedChildNode'}]
            }]
        });
        addNode({
            name: emptyPageName,
            parentPathOrId: `/sites/${siteKey}/home`,
            primaryNodeType: 'jnt:page',
            properties: [
                {name: 'jcr:title', value: 'Empty area test page', language: 'en'},
                {name: 'j:templateName', value: 'simple'}
            ],
            children: [{name: 'area-main', primaryNodeType: 'jnt:contentList', mixins: ['jmix:isAreaList']}]
        });
    });

    after(() => {
        cy.logout();
        deleteSite(siteKey);
    });

    beforeEach(() => {
        cy.loginAndStoreSession();
    });

    afterEach(() => {
        // Close the editor each test leaves open, even after a failure. No test edits a field, so Back closes it without a discard dialog
        cy.get('body').then($body => {
            if ($body.find(ContentEditor.defaultSelector).length > 0) {
                new ContentEditor().cancel();
            }
        });
    });

    it('creates a qant:namedChildNode with its default system name', () => {
        context.tag('page-builder', 'content-editor', 'named-content', 'system-name');
        const pageBuilder = visitPageBuilder(emptyPageName);
        const area = pageBuilder.getModule(emptyAreaPath, false);
        area.get().scrollIntoView();
        area.get().click('bottomLeft', {force: true});
        area.getAllCreateButtons().get().find('button[data-sel-role="createContent"]').click({force: true});
        const contentEditor = pageBuilder.getCreateContent()
            .getContentTypeSelector()
            .searchForContentType('qant:namedChildNode')
            .selectContentType('qant:namedChildNode')
            .create();

        contentEditor.getSmallTextField('nt:base_ce:systemName').checkValue('namedchildnode');
    });

    [
        {placeholder: 'namedBigText', nodeType: 'jnt:bigText'},
        {placeholder: 'namedText', nodeType: 'jnt:text'},
        {placeholder: 'namedChildren', nodeType: 'qant:namedChildren'}
    ].forEach(({placeholder, nodeType}) => {
        it(`creates the named child ${placeholder} with its name as a read-only system name`, () => {
            context.tag('page-builder', 'content-editor', 'named-content', 'system-name');
            assertSystemName(openCreateFromPlaceholder(placeholder, nodeType), placeholder, true);
        });
    });

    it('creates an unnamed child with an editable system name', () => {
        context.tag('page-builder', 'content-editor', 'named-content', 'system-name');
        assertSystemName(openCreateFromPlaceholder('*', 'jnt:text'), 'simple-text', false);
    });
});
