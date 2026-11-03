import {
    addMixins,
    addNode,
    Button,
    context,
    createSite,
    deleteNode,
    deleteSite,
    Dropdown,
    enableModule,
    getComponent,
    getComponentByRole,
    getComponentBySelector,
    Menu,
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

    // Each entry lists the links that reach one content. Whether the news link takes its vanity URL depends on
    // the host the browser uses: the CI reaches Jahia on a host other than the server name of the site.
    const assertRenderedLinks = (targets: string[][]) => {
        cy.get('body').should($body => {
            const hrefs = [...$body.find('a[href]')].map(a => a.getAttribute('href'));
            targets.forEach(alternatives => {
                const found = hrefs.some(href => alternatives.some(target => href.includes(target)));
                expect(found, `link to ${alternatives.join(' or ')} among ${hrefs.join(' , ')}`).to.be.true;
            });
        });
    };

    const renderedLinkTargets = [[`/${richTextA}.html`], [`/${richTextB}.html`], [`/${newsName}.html`, newsVanityUrl]];

    const selectView = (contentEditor: ContentEditor, fieldName: string, view: string) => {
        const field = contentEditor.getField(ChoiceListField, fieldName);
        field.get().scrollIntoView();
        field.get().should('be.visible');

        // Not ChoiceListField.selectValue: the view field sits at the bottom of the modal, where its menu opens
        // partly off screen, and selectValue clicks the option without force
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
        enableModule('event', siteKey);

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

    // The bootstrapSmall view of the Selenium test came from the Acme Space templates and no longer exists, so the
    // condensed view of an event stands for a second view.
    describe('event and list views', () => {
        const eventsPageName = 'eventViewsPage';
        const eventsPagePath = `${homePath}/${eventsPageName}`;
        const eventsAreaPath = `${eventsPagePath}/area-main`;
        const listPageName = 'listViewsPage';
        const listPagePath = `${homePath}/${listPageName}`;
        const listAreaPath = `${listPagePath}/area-main`;

        type Event = {name: string; title: string; body: string; startDate: string; endDate: string; location: string};
        const events: Event[] = [
            {name: 'satellite', title: 'Satellite launch', body: 'Satellite body text', startDate: '2026-05-12T10:00:00.000', endDate: '2026-05-14T10:00:00.000', location: 'Kourou'},
            {name: 'mars', title: 'Road to Mars', body: 'Mars body text', startDate: '2026-06-01T10:00:00.000', endDate: '2026-06-02T10:00:00.000', location: 'Houston'}
        ];
        const [satellite] = events;
        const news = [
            {name: 'news1', title: 'News one title', desc: 'News one description', vanityUrl: '/news/news-one-title'},
            {name: 'news2', title: 'News two title', desc: 'News two description', vanityUrl: '/news/news-two-title'}
        ];

        type EventView = 'default' | 'condensed' | 'detail' | 'link';

        // The markup that tells each view of an event apart, read in the element that holds the event
        const expectEventView = ($root: JQuery, event: Event, view: EventView) => {
            const titleLinks = $root.find(`a[href*="/${event.name}.html"]`);
            expect(titleLinks.text(), `title link of ${event.name}`).to.contain(event.title);
            const text = $root.text();
            switch (view) {
                case 'default':
                    expect($root.find('.eventsListItem'), `default view of ${event.name}`).to.have.length.of.at.least(1);
                    break;
                case 'condensed':
                    expect($root.find(`h4 a[href*="/${event.name}.html"]`), `condensed view of ${event.name}`).to.have.length(1);
                    expect(text, `condensed view of ${event.name}`).not.to.contain(event.body);
                    break;
                case 'detail':
                    expect(text, `detail view of ${event.name}`).to.contain(event.body);
                    expect($root.find('a.ics'), `calendar link of the detail view of ${event.name}`).to.have.length.of.at.least(1);
                    break;
                case 'link':
                    expect($root.find('.eventsListItem, h2, h4'), `link view of ${event.name}`).to.have.length(0);
                    expect(text, `link view of ${event.name}`).not.to.contain(event.body);
                    break;
                default:
                    throw new Error(`Unknown view ${view}`);
            }
        };

        const assertEventViewInPageBuilder = (pageBuilder: JContentPageBuilder, event: Event, view: EventView) => {
            const module = pageBuilder.getModule(`${eventsAreaPath}/${event.name}`);
            module.get().scrollIntoView();
            module.get().should($module => expectEventView($module, event, view));
        };

        // Preview and live render no module element, so read the column that holds the events
        const assertEventViewRendered = (url: string, event: Event, view: EventView) => {
            cy.visit(url);
            cy.get(`a[href*="/${event.name}.html"]`).first().closest('.col-md-12').should($column => expectEventView($column, event, view));
        };

        const visitPage = (page: string): JContentPageBuilder => JContent
            .visit(siteKey, 'en', `pages/home/${page}`)
            .switchToPageBuilder();

        const editArea = (page: string, path: string): ContentEditor => {
            visitPage(page).getModule(path, false).boxHeaderContextMenu().selectByRole('edit');
            const contentEditor = new ContentEditor();
            contentEditor.openSection('layout');
            return contentEditor;
        };

        const editEvent = (event: Event): ContentEditor => {
            visitPage(eventsPageName).getModule(`${eventsAreaPath}/${event.name}`, false).contextMenu(true).selectByRole('edit');
            const contentEditor = new ContentEditor();
            contentEditor.openSection('layout');
            return contentEditor;
        };

        const clearChoice = (contentEditor: ContentEditor, fieldName: string) => {
            const field = contentEditor.getField(ChoiceListField, fieldName);
            field.get().scrollIntoView();
            getComponentByRole(Button, 'content-editor/field/Choicelist', field).click();
            getComponentBySelector(Menu, `#menuHolder ${Menu.defaultSelector}`).selectByRole('unsetFieldActionChoiceList');
            field.assertSelected('');
        };

        const publishPage = (path: string) => publishAndWaitJobEnding(path, ['en']);

        // A test that publishes leaves a live copy, so remove both before the pages are created again
        const removePage = (path: string) => {
            deleteNode(path);
            deleteNode(path, 'LIVE');
        };

        // Each test starts from pages with no view set
        beforeEach(() => {
            removePage(eventsPagePath);
            removePage(listPagePath);
            addNode({
                name: eventsPageName,
                parentPathOrId: homePath,
                primaryNodeType: 'jnt:page',
                properties: [
                    {name: 'jcr:title', value: 'Event views test page', language: 'en'},
                    {name: 'j:templateName', value: 'simple'}
                ],
                children: [{
                    name: 'area-main',
                    primaryNodeType: 'jnt:contentList',
                    mixins: ['jmix:isAreaList'],
                    children: events.map(event => ({
                        name: event.name,
                        primaryNodeType: 'jnt:event',
                        properties: [
                            {name: 'jcr:title', value: event.title, language: 'en'},
                            {name: 'body', value: `<p>${event.body}</p>`, language: 'en'},
                            {name: 'location', value: event.location, language: 'en'},
                            {name: 'startDate', value: event.startDate},
                            {name: 'endDate', value: event.endDate},
                            {name: 'eventsType', value: 'meeting'}
                        ]
                    }))
                }]
            });
            addNode({
                name: listPageName,
                parentPathOrId: homePath,
                primaryNodeType: 'jnt:page',
                properties: [
                    {name: 'jcr:title', value: 'List views test page', language: 'en'},
                    {name: 'j:templateName', value: 'simple'}
                ],
                children: [{
                    name: 'area-main',
                    primaryNodeType: 'jnt:contentList',
                    mixins: ['jmix:isAreaList'],
                    children: news.map(item => ({
                        name: item.name,
                        primaryNodeType: 'jnt:news',
                        properties: [
                            {name: 'jcr:title', value: item.title, language: 'en'},
                            {name: 'desc', value: `<p>${item.desc}</p>`, language: 'en'}
                        ]
                    }))
                }]
            });
            // The home page carries the new pages, and a page publishes only under a published parent
            publishAndWaitJobEnding(homePath, ['en']);
        });

        it('offers the views of an event as sub content views of an area', () => {
            context.tag('page-builder', 'content-views', 'sub-content-view');
            const contentEditor = editArea(eventsPageName, eventsAreaPath);
            const field = contentEditor.getField(ChoiceListField, 'jmix:renderableList_j:subNodesView');
            field.get().scrollIntoView();
            const dropdown = getComponent(Dropdown, field);
            dropdown.get().click('right');
            ['default', 'condensed', 'detail', 'link'].forEach(view => {
                dropdown.get().find(`.moonstone-menuItem[data-value="${view}"]`).should('exist');
            });
        });

        it('renders the events of an area with the condensed sub content view, in edit, preview and live', () => {
            context.tag('page-builder', 'content-views', 'sub-content-view', 'preview', 'live');
            const contentEditor = editArea(eventsPageName, eventsAreaPath);
            selectView(contentEditor, 'jmix:renderableList_j:subNodesView', 'condensed');
            contentEditor.save();

            const pageBuilder = visitPage(eventsPageName);
            events.forEach(event => assertEventViewInPageBuilder(pageBuilder, event, 'condensed'));

            events.forEach(event => assertEventViewRendered(`/cms/render/default/en${eventsPagePath}.html`, event, 'condensed'));
            publishPage(eventsPagePath);
            events.forEach(event => assertEventViewRendered(`/cms/render/live/en${eventsPagePath}.html`, event, 'condensed'));
        });

        it('renders the events of an area with the detail sub content view', () => {
            context.tag('page-builder', 'content-views', 'sub-content-view');
            const contentEditor = editArea(eventsPageName, eventsAreaPath);
            selectView(contentEditor, 'jmix:renderableList_j:subNodesView', 'detail');
            contentEditor.save();

            const pageBuilder = visitPage(eventsPageName);
            events.forEach(event => assertEventViewInPageBuilder(pageBuilder, event, 'detail'));
        });

        it('renders the events of an area with their default view again, when the default sub content view is selected or the field is cleared', () => {
            context.tag('page-builder', 'content-views', 'sub-content-view', 'default-view');
            setNodeProperty(eventsAreaPath, 'j:subNodesView', 'link', 'en');
            let pageBuilder = visitPage(eventsPageName);
            events.forEach(event => assertEventViewInPageBuilder(pageBuilder, event, 'link'));

            let contentEditor = editArea(eventsPageName, eventsAreaPath);
            selectView(contentEditor, 'jmix:renderableList_j:subNodesView', 'default');
            contentEditor.save();
            pageBuilder = visitPage(eventsPageName);
            events.forEach(event => assertEventViewInPageBuilder(pageBuilder, event, 'default'));

            setNodeProperty(eventsAreaPath, 'j:subNodesView', 'link', 'en');
            contentEditor = editArea(eventsPageName, eventsAreaPath);
            clearChoice(contentEditor, 'jmix:renderableList_j:subNodesView');
            contentEditor.save();
            pageBuilder = visitPage(eventsPageName);
            events.forEach(event => assertEventViewInPageBuilder(pageBuilder, event, 'default'));
        });

        it('renders an event with the view selected in its view option, in edit and live', () => {
            context.tag('page-builder', 'content-views', 'renderable', 'live');
            const contentEditor = editEvent(satellite);
            contentEditor.toggleOption('jmix:renderable');
            selectView(contentEditor, 'jmix:renderable_j:view', 'condensed');
            contentEditor.save();

            assertEventViewInPageBuilder(visitPage(eventsPageName), satellite, 'condensed');
            publishPage(eventsPagePath);
            assertEventViewRendered(`/cms/render/live/en${eventsPagePath}.html`, satellite, 'condensed');
        });

        it('renders an event with its default view again once its view option is removed', () => {
            context.tag('page-builder', 'content-views', 'renderable', 'default-view');
            addMixins(`${eventsAreaPath}/${satellite.name}`, ['jmix:renderable']);
            setNodeProperty(`${eventsAreaPath}/${satellite.name}`, 'j:view', 'link', 'en');
            assertEventViewInPageBuilder(visitPage(eventsPageName), satellite, 'link');

            const contentEditor = editEvent(satellite);
            contentEditor.toggleOption('jmix:renderable');
            contentEditor.save();

            assertEventViewInPageBuilder(visitPage(eventsPageName), satellite, 'default');
        });

        it('renders a list in two columns with the columns view', () => {
            context.tag('page-builder', 'content-views', 'list-view');
            const contentEditor = editArea(listPageName, listAreaPath);
            contentEditor.toggleOption('jmix:renderable');
            selectView(contentEditor, 'jmix:renderable_j:view', 'columns');
            // The columns view brings its number of columns field, with no option to toggle
            contentEditor.getSmallTextField('jmix:columns_j:columns').addNewValue('2');
            contentEditor.save();

            const area = visitPage(listPageName).getModule(listAreaPath);
            area.get().scrollIntoView();
            // Page Builder adds its create button as one more column item, so look for each news in a column
            news.forEach(item => {
                area.get().find(`.columns2 .column-item [jahiatype="module"][path="${listAreaPath}/${item.name}"]`).should('exist');
            });
        });

        it('renders a list as links with the linkList view, in edit and live, and as full items once the view option is removed', () => {
            context.tag('page-builder', 'content-views', 'list-view', 'live');
            const assertLinkList = ($root: JQuery) => {
                news.forEach(item => {
                    // In live, the link may take the vanity URL of the news, as in the test of the link views above
                    const href = $root.find(`li a:contains("${item.title}")`).attr('href') ?? '';
                    expect([`/${item.name}.html`, item.vanityUrl].some(target => href.includes(target)), `link to ${item.name}, found ${href}`).to.be.true;
                    expect($root.text(), `description of ${item.name}`).not.to.contain(item.desc);
                });
            };

            let contentEditor = editArea(listPageName, listAreaPath);
            contentEditor.toggleOption('jmix:renderable');
            selectView(contentEditor, 'jmix:renderable_j:view', 'linkList');
            contentEditor.save();

            let area = visitPage(listPageName).getModule(listAreaPath);
            area.get().scrollIntoView();
            area.get().should(assertLinkList);

            publishPage(listPagePath);
            cy.visit(`/cms/render/live/en${listPagePath}.html`);
            cy.contains('li a', news[0].title).closest('.col-md-12').should(assertLinkList);

            contentEditor = editArea(listPageName, listAreaPath);
            contentEditor.toggleOption('jmix:renderable');
            contentEditor.save();

            area = visitPage(listPageName).getModule(listAreaPath);
            area.get().scrollIntoView();
            area.get().should($area => {
                news.forEach(item => expect($area.text(), `description of ${item.name}`).to.contain(item.desc));
            });
        });
    });
});
