import {
    addNode,
    context,
    createSite,
    createUser,
    deleteSite,
    deleteUser,
    grantRoles,
    jfaker,
    publishAndWaitJobEnding,
    uploadFile
} from '@jahia/cypress';
import {JContent, JContentPageBuilder} from '../../page-object';

// Migrated from the Selenium class CopyCutPasteContent, split in https://github.com/Jahia/selenium/issues/1668.
// Each describe is one legacy journey: its tests run in order, and a nested before() plays the next act.

const PREFIX = 'ccpc';
const PASSWORD = 'password';
const AREA = 'area-main';

type Fixture = {
    user: string;
    siteA: string;
    siteB: string;
    subPage: string;
    subPageTitle: string;
    news: string;
    newsTitle: string;
    fileRef: string;
    fileName: string;
};

const newFixture = (): Fixture => {
    const id = jfaker.string.alphanumeric({length: 8, casing: 'lower', safe: true});
    return {
        user: `${PREFIX}${id}`,
        siteA: `${PREFIX}${id}a`,
        siteB: `${PREFIX}${id}b`,
        subPage: `subpage-${id}`,
        subPageTitle: `Subpage ${id}`,
        news: `news-${id}`,
        newsTitle: `News ${id}`,
        fileRef: `fileref-${id}`,
        fileName: `${PREFIX}-${id}.pdf`
    };
};

const homePath = (site: string) => `/sites/${site}/home`;
const homeArea = (site: string) => `${homePath(site)}/${AREA}`;
const subPagePath = (f: Fixture) => `${homePath(f.siteA)}/${f.subPage}`;
const subPageArea = (f: Fixture) => `${subPagePath(f)}/${AREA}`;

// A previous run whose after() failed leaves its sites and users behind: remove them first.
const removeStaleFixtures = () => {
    cy.apollo({
        queryFile: 'jcontent/copyCutPasteContent/staleFixtures.graphql',
        variables: {
            sitesQuery: `SELECT * FROM [jnt:virtualsite] WHERE ISCHILDNODE('/sites') AND localname() LIKE '${PREFIX}%'`,
            usersQuery: `SELECT * FROM [jnt:user] WHERE localname() LIKE '${PREFIX}%'`
        }
    }).then(({data}) => {
        data.jcr.sites.nodes.forEach(({name}) => deleteSite(name));
        data.jcr.users.nodes.forEach(({name}) => deleteUser(name));
    });
};

const createEditorSite = (site: string, user: string) => {
    createSite(site, {templateSet: 'dx-base-demo-templates', serverName: 'localhost', locale: 'en'});
    addNode({parentPathOrId: homePath(site), name: AREA, primaryNodeType: 'jnt:contentList'});
    grantRoles(`/sites/${site}`, ['editor-in-chief'], user, 'USER');
};

const createFixture = (f: Fixture, sites: string[]) => {
    createUser(f.user, PASSWORD);
    sites.forEach(site => createEditorSite(site, f.user));
    addNode({
        parentPathOrId: homeArea(f.siteA),
        name: f.news,
        primaryNodeType: 'jnt:news',
        properties: [
            {name: 'jcr:title', value: f.newsTitle, language: 'en'},
            {name: 'desc', value: `<p>Body of ${f.newsTitle}</p>`, language: 'en'}
        ]
    });
};

const deleteFixture = (f: Fixture, sites: string[]) => {
    cy.logout();
    sites.forEach(site => deleteSite(site));
    deleteUser(f.user);
};

const addSubPage = (f: Fixture) => {
    addNode({
        parentPathOrId: homePath(f.siteA),
        name: f.subPage,
        primaryNodeType: 'jnt:page',
        properties: [
            {name: 'jcr:title', value: f.subPageTitle, language: 'en'},
            {name: 'j:templateName', value: 'simple'}
        ],
        children: [{name: AREA, primaryNodeType: 'jnt:contentList'}]
    });
};

// The legacy test publishes the site once the file reference is on the home page, before it copies or cuts it.
const addPublishedFileReference = (f: Fixture) => {
    uploadFile('/assets/uploadMedia/myfile.pdf', `/sites/${f.siteA}/files`, f.fileName, 'application/pdf');
    addNode({
        parentPathOrId: homeArea(f.siteA),
        name: f.fileRef,
        primaryNodeType: 'jnt:fileReference',
        properties: [{name: 'j:node', value: `/sites/${f.siteA}/files/${f.fileName}`, type: 'REFERENCE'}]
    });
    publishAndWaitJobEnding(`/sites/${f.siteA}`, ['en']);
};

const openPageBuilder = (site: string, page = 'home'): JContentPageBuilder =>
    JContent.visit(site, 'en', `pages/${page}`).switchToPageBuilder();

// The site switcher keeps the jContent path of the previous site, so the home page is opened explicitly.
const switchSite = (jcontent: JContentPageBuilder, site: string): JContentPageBuilder => {
    jcontent.getSiteSwitcher().select(site);
    cy.url().should('contain', `/jcontent/${site}/`);
    jcontent.getAccordionItem('pages').getTreeItem('home').click();
    return jcontent.switchToPageBuilder();
};

const putInClipboard = (jcontent: JContentPageBuilder, path: string, role: 'copy' | 'cut') => {
    // Not forced, or the right-click may open the context menu of the page
    const contextMenu = jcontent.getModule(path, false).contextMenu(true, false);
    cy.waitUntil(() => contextMenu.selectByRole(role));
    cy.get('#message-id').should('contain', 'in the clipboard');
};

// The clipboard is carried to the sub-page inside jContent, as the legacy openPage did: a full page load
// restores the clipboard from localStorage, which jContent fails to write for a node that has a j:node.
const openSubPage = (jcontent: JContentPageBuilder, f: Fixture): JContentPageBuilder => {
    const pages = jcontent.getAccordionItem('pages');
    pages.expandTreeItem('home');
    pages.getTreeItem(f.subPage).click();
    cy.url().should('contain', `/pages/home/${f.subPage}`);
    return jcontent.switchToPageBuilder();
};

const pasteInto = (jcontent: JContentPageBuilder, areaPath: string) => {
    jcontent.getModule(areaPath).getCreateButtons().getButtonByRole('paste').click();
    cy.get('#message-id').should('contain', 'successfully pasted');
};

// Each check opens the page anew: after a paste, the frame of Page Builder reloads under the alias of the old one.
const shouldShowModule = (site: string, page: string, path: string, text?: string) => {
    const module = openPageBuilder(site, page).getModule(path);
    if (text) {
        module.get().should('contain', text);
    }
};

// The area renders before the absence is read, so an empty frame cannot pass.
const shouldNotShowModule = (site: string, areaPath: string, path: string) => {
    const jcontent = openPageBuilder(site);
    jcontent.getModule(areaPath);
    jcontent.iframe().get().find(`[jahiatype="module"][path="${path}"]`).should('not.exist');
};

type Workspace = 'live' | 'default';

// The home link of the navigation proves that the page rendered, before an absence is read.
const visitRendered = (workspace: Workspace, site: string) => {
    cy.visit(`/cms/render/${workspace}/en/sites/${site}/home.html`);
    cy.get(`a[href$="/sites/${site}/home.html"]`).should('exist');
};

const shouldRender = (f: Fixture, news: boolean, fileRef: boolean) => {
    cy.get('body').should(news ? 'contain' : 'not.contain', f.newsTitle);
    cy.get(`a[href*="${f.fileName}"]`).should(fileRef ? 'exist' : 'not.exist');
};

// Live is the published site, preview the default workspace: the same checks run on both.
const checkSameSite = (workspace: Workspace, f: Fixture, onHome: boolean) => {
    visitRendered(workspace, f.siteA);
    shouldRender(f, onHome, onHome);
    cy.contains('a', f.subPageTitle).click({force: true});
    cy.url().should('contain', `/${f.subPage}.html`);
    shouldRender(f, true, true);
};

const checkCrossSite = (workspace: Workspace, f: Fixture, onSiteA: boolean) => {
    visitRendered(workspace, f.siteA);
    shouldRender(f, onSiteA, onSiteA);
    visitRendered(workspace, f.siteB);
    shouldRender(f, true, true);
};

describe('Page builder - copy, cut and paste content', () => {
    before(() => {
        removeStaleFixtures();
    });

    describe('Copy on the same site', () => {
        const f = newFixture();
        const sites = [f.siteA];

        before(() => {
            createFixture(f, sites);
            addSubPage(f);
        });

        after(() => deleteFixture(f, sites));

        beforeEach(() => cy.login(f.user, PASSWORD));

        it('FT-001: Copied news is pasted on another page of the same site', () => {
            context.tag('copy-paste', 'same-site', 'news', 'edit-mode', 'testrail-case-2924367');
            const jcontent = openPageBuilder(f.siteA);
            putInClipboard(jcontent, `${homeArea(f.siteA)}/${f.news}`, 'copy');
            const subPage = openSubPage(jcontent, f);
            pasteInto(subPage, subPageArea(f));
            shouldShowModule(f.siteA, `home/${f.subPage}`, `${subPageArea(f)}/${f.news}`, f.newsTitle);
            shouldShowModule(f.siteA, 'home', `${homeArea(f.siteA)}/${f.news}`, f.newsTitle);
        });

        describe('once a published file reference is on the home page', () => {
            before(() => addPublishedFileReference(f));

            it('FT-002: Copied file reference is pasted on another page of the same site', () => {
                context.tag('copy-paste', 'same-site', 'file-reference', 'edit-mode', 'testrail-case-2924367');
                const jcontent = openPageBuilder(f.siteA);
                putInClipboard(jcontent, `${homeArea(f.siteA)}/${f.fileRef}`, 'copy');
                const subPage = openSubPage(jcontent, f);
                pasteInto(subPage, subPageArea(f));
                shouldShowModule(f.siteA, `home/${f.subPage}`, `${subPageArea(f)}/${f.fileRef}`);
                shouldShowModule(f.siteA, 'home', `${homeArea(f.siteA)}/${f.fileRef}`);
            });

            describe('once site A is published', () => {
                before(() => publishAndWaitJobEnding(`/sites/${f.siteA}`, ['en']));

                it('FT-003: Copies on the same site are rendered in live after publication', () => {
                    context.tag('copy-paste', 'same-site', 'live-mode', 'testrail-case-2924367');
                    checkSameSite('live', f, true);
                });

                it('FT-004: Copies on the same site are rendered in preview', () => {
                    context.tag('copy-paste', 'same-site', 'preview-mode', 'testrail-case-2924367');
                    checkSameSite('default', f, true);
                });
            });
        });
    });

    describe('Cut on the same site', () => {
        const f = newFixture();
        const sites = [f.siteA];

        before(() => {
            createFixture(f, sites);
            addSubPage(f);
        });

        after(() => deleteFixture(f, sites));

        beforeEach(() => cy.login(f.user, PASSWORD));

        it('FT-005: Cut news is moved to another page of the same site', () => {
            context.tag('cut-paste', 'same-site', 'news', 'edit-mode', 'testrail-case-2924368');
            const jcontent = openPageBuilder(f.siteA);
            putInClipboard(jcontent, `${homeArea(f.siteA)}/${f.news}`, 'cut');
            const subPage = openSubPage(jcontent, f);
            pasteInto(subPage, subPageArea(f));
            shouldShowModule(f.siteA, `home/${f.subPage}`, `${subPageArea(f)}/${f.news}`, f.newsTitle);
            shouldNotShowModule(f.siteA, homeArea(f.siteA), `${homeArea(f.siteA)}/${f.news}`);
        });

        describe('once a published file reference is on the home page', () => {
            before(() => addPublishedFileReference(f));

            it('FT-006: Cut file reference is moved to another page of the same site', () => {
                context.tag('cut-paste', 'same-site', 'file-reference', 'edit-mode', 'testrail-case-2924368');
                const jcontent = openPageBuilder(f.siteA);
                putInClipboard(jcontent, `${homeArea(f.siteA)}/${f.fileRef}`, 'cut');
                const subPage = openSubPage(jcontent, f);
                pasteInto(subPage, subPageArea(f));
                shouldShowModule(f.siteA, `home/${f.subPage}`, `${subPageArea(f)}/${f.fileRef}`);
                shouldNotShowModule(f.siteA, homeArea(f.siteA), `${homeArea(f.siteA)}/${f.fileRef}`);
            });

            describe('once site A is published', () => {
                before(() => publishAndWaitJobEnding(`/sites/${f.siteA}`, ['en']));

                it('FT-007: Cut content on the same site is moved in live after publication', () => {
                    context.tag('cut-paste', 'same-site', 'live-mode', 'testrail-case-2924368');
                    checkSameSite('live', f, false);
                });

                it('FT-008: Cut content on the same site is moved in preview', () => {
                    context.tag('cut-paste', 'same-site', 'preview-mode', 'testrail-case-2924368');
                    checkSameSite('default', f, false);
                });
            });
        });
    });

    describe('Copy to another site', () => {
        const f = newFixture();
        const sites = [f.siteA, f.siteB];

        before(() => createFixture(f, sites));

        after(() => deleteFixture(f, sites));

        beforeEach(() => cy.login(f.user, PASSWORD));

        it('FT-009: Copied news is pasted on another site', () => {
            context.tag('copy-paste', 'cross-site', 'news', 'edit-mode', 'testrail-case-2924369');
            const jcontent = openPageBuilder(f.siteA);
            putInClipboard(jcontent, `${homeArea(f.siteA)}/${f.news}`, 'copy');
            const siteB = switchSite(jcontent, f.siteB);
            pasteInto(siteB, homeArea(f.siteB));
            shouldShowModule(f.siteB, 'home', `${homeArea(f.siteB)}/${f.news}`, f.newsTitle);
            shouldShowModule(f.siteA, 'home', `${homeArea(f.siteA)}/${f.news}`, f.newsTitle);
        });

        describe('once a published file reference is on the home page of site A', () => {
            before(() => addPublishedFileReference(f));

            it('FT-010: Copied file reference is pasted on another site', () => {
                context.tag('copy-paste', 'cross-site', 'file-reference', 'edit-mode', 'testrail-case-2924369');
                const jcontent = openPageBuilder(f.siteA);
                putInClipboard(jcontent, `${homeArea(f.siteA)}/${f.fileRef}`, 'copy');
                const siteB = switchSite(jcontent, f.siteB);
                pasteInto(siteB, homeArea(f.siteB));
                shouldShowModule(f.siteB, 'home', `${homeArea(f.siteB)}/${f.fileRef}`);
                shouldShowModule(f.siteA, 'home', `${homeArea(f.siteA)}/${f.fileRef}`);
            });

            describe('once site B is published', () => {
                before(() => publishAndWaitJobEnding(`/sites/${f.siteB}`, ['en']));

                it('FT-011: Cross-site copies are rendered in live after publication', () => {
                    context.tag('copy-paste', 'cross-site', 'live-mode', 'testrail-case-2924369');
                    checkCrossSite('live', f, true);
                });

                it('FT-012: Cross-site copies are rendered in preview', () => {
                    context.tag('copy-paste', 'cross-site', 'preview-mode', 'testrail-case-2924369');
                    checkCrossSite('default', f, true);
                });
            });
        });
    });

    describe('Cut to another site', () => {
        const f = newFixture();
        const sites = [f.siteA, f.siteB];

        before(() => createFixture(f, sites));

        after(() => deleteFixture(f, sites));

        beforeEach(() => cy.login(f.user, PASSWORD));

        it('FT-013: Cut news is moved to another site', () => {
            context.tag('cut-paste', 'cross-site', 'news', 'edit-mode', 'testrail-case-2924370');
            const jcontent = openPageBuilder(f.siteA);
            putInClipboard(jcontent, `${homeArea(f.siteA)}/${f.news}`, 'cut');
            const siteB = switchSite(jcontent, f.siteB);
            pasteInto(siteB, homeArea(f.siteB));
            shouldShowModule(f.siteB, 'home', `${homeArea(f.siteB)}/${f.news}`, f.newsTitle);
            shouldNotShowModule(f.siteA, homeArea(f.siteA), `${homeArea(f.siteA)}/${f.news}`);
        });

        describe('once a published file reference is on the home page of site A', () => {
            before(() => addPublishedFileReference(f));

            it('FT-014: Cut file reference is moved to another site', () => {
                context.tag('cut-paste', 'cross-site', 'file-reference', 'edit-mode', 'testrail-case-2924370');
                const jcontent = openPageBuilder(f.siteA);
                putInClipboard(jcontent, `${homeArea(f.siteA)}/${f.fileRef}`, 'cut');
                const siteB = switchSite(jcontent, f.siteB);
                pasteInto(siteB, homeArea(f.siteB));
                shouldShowModule(f.siteB, 'home', `${homeArea(f.siteB)}/${f.fileRef}`);
                shouldNotShowModule(f.siteA, homeArea(f.siteA), `${homeArea(f.siteA)}/${f.fileRef}`);
            });

            describe('once site B, then site A, are published', () => {
                before(() => {
                    publishAndWaitJobEnding(`/sites/${f.siteB}`, ['en']);
                    publishAndWaitJobEnding(`/sites/${f.siteA}`, ['en']);
                });

                it('FT-015: Cross-site cut content is moved in live after publication', () => {
                    context.tag('cut-paste', 'cross-site', 'live-mode', 'testrail-case-2924370');
                    checkCrossSite('live', f, false);
                });

                it('FT-016: Cross-site cut content is moved in preview', () => {
                    context.tag('cut-paste', 'cross-site', 'preview-mode', 'testrail-case-2924370');
                    checkCrossSite('default', f, false);
                });
            });
        });
    });
});
