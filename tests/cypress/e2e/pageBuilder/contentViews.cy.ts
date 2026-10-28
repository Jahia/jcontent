import {
    addMixins,
    addNode,
    context,
    createSite,
    deleteSite,
    enableModule,
    publishAndWaitJobEnding,
    setNodeProperty
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
    const newsVanityUrl = '/news/news-a-title';

    const linkSelector = (name: string) => `a[href$="/${name}.html"]`;

    const assertRenderedLinks = (targets: string[]) => {
        cy.get('body').should($body => {
            const hrefs = [...$body.find('a[href]')].map(a => a.getAttribute('href')).join(' , ');
            targets.forEach(target => {
                expect(hrefs, `link to ${target} among`).to.contain(target);
            });
        });
    };

    const renderedLinkTargets = [`/${richTextA}.html`, `/${richTextB}.html`, newsVanityUrl];

    const selectView = (contentEditor: ContentEditor, fieldName: string, view: string) => {
        const field = contentEditor.getField(ChoiceListField, fieldName);
        field.get().scrollIntoView();
        field.selectValue(view);
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
        context.tag('page-builder', 'content-views', 'renderable');
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
        context.tag('page-builder', 'content-views', 'sub-content-view');
        let pageBuilder = visitPageBuilder();

        cy.log('Open content editor for the area');
        pageBuilder.getModule(areaPath, false).boxHeaderContextMenu().selectByRole('edit');

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
        context.tag('page-builder', 'content-views', 'preview', 'live');
        cy.log('Set the views the two tests above select in Content Editor, so this test runs on its own');
        addMixins(`${landingPath}/${richTextA}`, ['jmix:renderable']);
        setNodeProperty(`${landingPath}/${richTextA}`, 'j:view', 'link', 'en');
        setNodeProperty(areaPath, 'j:subNodesView', 'link', 'en');

        cy.log('Verify the links in preview');
        cy.visit(`/cms/render/default/en${pagePath}.html`);
        assertRenderedLinks(renderedLinkTargets);

        cy.log('Publish the page and verify the links in live');
        publishAndWaitJobEnding(pagePath, ['en']);
        cy.visit(`/cms/render/live/en${pagePath}.html`);
        assertRenderedLinks(renderedLinkTargets);
    });
});
