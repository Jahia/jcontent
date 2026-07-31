import {
    addNode,
    createSite,
    deleteSite,
    Dropdown,
    enableModule,
    getComponent,
    getComponentBySelector,
    Menu,
    publishAndWaitJobEnding
} from '@jahia/cypress';
import {ContentEditor, JContent, JContentPageBuilder} from '../../page-object';
import {ChoiceListField} from '../../page-object/fields';

describe('Page builder - content views', () => {
    const siteKey = 'contentViewsSite';
    const homePath = `/sites/${siteKey}/home`;
    const pageName = 'contentViewsPage';
    const pagePath = `${homePath}/${pageName}`;
    const areaPath = `${pagePath}/area-main`;
    const landingPath = `${pagePath}/landing`;

    const richTextA = 'richtextA';
    const richTextB = 'richtextB';
    const newsName = 'newsA';

    const linkSelector = (name: string) => `a[href*="/${name}."][href$=".html"]`;

    const selectView = (contentEditor: ContentEditor, fieldName: string, view: string) => {
        const field = contentEditor.getField(ChoiceListField, fieldName);
        field.get().scrollIntoView();
        field.get().should('be.visible');

        const dropdown = getComponent(Dropdown, field);
        dropdown.get().click('right');
        dropdown.get().find('.moonstone-menu').should('exist');
        dropdown.get().find(`.moonstone-menuItem[data-value="${view}"]`).should('exist').trigger('click', {force: true});
        field.assertSelected(view);
    };

    const visitPageBuilder = (): JContentPageBuilder => JContent
        .visit(siteKey, 'en', `pages/home/${pageName}`)
        .switchToPageBuilder();

    const assertRenderedAsLink = (pageBuilder: JContentPageBuilder, parentPath: string, name: string) => {
        const module = pageBuilder.getModule(`${parentPath}/${name}`);
        module.get().scrollIntoView();
        module.get().find(linkSelector(name)).should('exist');
    };

    before(() => {
        createSite(siteKey, {
            templateSet: 'dx-base-demo-templates',
            serverName: 'localhost',
            locale: 'en'
        });
        enableModule('news', siteKey);

        addNode({
            name: pageName,
            parentPathOrId: homePath,
            primaryNodeType: 'jnt:page',
            properties: [
                {name: 'jcr:title', value: 'Content views test page', language: 'en'},
                {name: 'j:templateName', value: 'simple'}
            ],
            children: [
                {
                    name: 'landing',
                    primaryNodeType: 'jnt:contentList',
                    mixins: ['jmix:isAreaList'],
                    children: [{
                        name: richTextA,
                        primaryNodeType: 'jnt:bigText',
                        properties: [{name: 'text', value: 'Rich text A content', language: 'en'}]
                    }]
                },
                {
                    name: 'area-main',
                    primaryNodeType: 'jnt:contentList',
                    mixins: ['jmix:isAreaList'],
                    children: [
                        {
                            name: richTextB,
                            primaryNodeType: 'jnt:bigText',
                            properties: [{name: 'text', value: 'Rich text B content', language: 'en'}]
                        },
                        {
                            name: newsName,
                            primaryNodeType: 'jnt:news',
                            properties: [
                                {name: 'jcr:title', value: 'News A title', language: 'en'},
                                {name: 'desc', value: 'News A description', language: 'en'}
                            ]
                        }
                    ]
                }
            ]
        });
    });

    after(() => {
        cy.logout();
        deleteSite(siteKey);
    });

    beforeEach(() => {
        cy.loginAndStoreSession();
    });

    it('renders richtextA as a link when its jmix:renderable view is set to "link"', () => {
        let pageBuilder = visitPageBuilder();

        cy.log('Open content editor for richtextA');
        pageBuilder.getModule(`${landingPath}/${richTextA}`, false).contextMenu(true).selectByRole('edit');

        cy.log('Activate the view option (jmix:renderable) in the layout section and select the link view');
        const contentEditor = new ContentEditor();
        contentEditor.openSection('layout');
        contentEditor.toggleOption('jmix:renderable');
        selectView(contentEditor, 'jmix:renderable_j:view', 'link');
        contentEditor.save();

        cy.log('Verify richtextA is rendered as a link');
        pageBuilder = visitPageBuilder();
        assertRenderedAsLink(pageBuilder, landingPath, richTextA);
    });

    it('renders the area sub contents as links when its sub content view is set to "link"', () => {
        let pageBuilder = visitPageBuilder();

        cy.log('Open content editor for the area');
        const area = pageBuilder.getModule(areaPath, false);
        area.get().scrollIntoView();
        area.get().click('bottomLeft', {force: true});
        area.getBox().getHeader().get().should('be.visible').rightclick({force: true});
        getComponentBySelector(Menu, '#menuHolder .moonstone-menu:not(.moonstone-hidden)').selectByRole('edit');

        cy.log('Select the link view as sub content view (j:subNodesView) in the layout section');
        const contentEditor = new ContentEditor();
        contentEditor.openSection('layout');
        selectView(contentEditor, 'jmix:renderableList_j:subNodesView', 'link');
        contentEditor.save();

        cy.log('Verify richtextB and the news are rendered as links');
        pageBuilder = visitPageBuilder();
        assertRenderedAsLink(pageBuilder, areaPath, richTextB);
        assertRenderedAsLink(pageBuilder, areaPath, newsName);
    });

    it('renders contents as links in preview and in live', () => {
        cy.log('Verify the links in preview');
        cy.visit(`/cms/render/default/en${pagePath}.html`);
        [richTextA, richTextB, newsName].forEach(name => {
            cy.get(linkSelector(name)).should('exist');
        });

        cy.log('Publish the page and verify the links in live');
        publishAndWaitJobEnding(pagePath, ['en']);
        cy.visit(`/cms/render/live/en${pagePath}.html`);
        [richTextA, richTextB, newsName].forEach(name => {
            cy.get(linkSelector(name)).should('exist');
        });
    });
});
