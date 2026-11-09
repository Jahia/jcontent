import {
    addNode,
    context,
    createSite,
    createUser,
    deleteSite,
    deleteUser,
    getNodeByPath,
    grantRoles,
    jfaker,
    publishAndWaitJobEnding,
    uploadFile
} from '@jahia/cypress';
import {JContent, JContentPageBuilder} from '../../page-object';
import {GraphqlUtils} from '../../utils/graphqlUtils';

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

type Role = 'copy' | 'cut';

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

const publish = (path: string) => publishAndWaitJobEnding(path, ['en']);
const publishSite = (site: string) => publish(`/sites/${site}`);

// A previous run whose after() failed leaves its sites and users behind: remove them first.
const removeStaleFixtures = () => {
    cy.apollo({
        queryFile: 'jcontent/copyCutPasteContent/staleFixtures.graphql',
        variables: {
            sitesQuery: `SELECT * FROM [jnt:virtualsite] WHERE ISCHILDNODE('/sites') AND localname() LIKE '${PREFIX}%'`,
            usersQuery: `SELECT * FROM [jnt:user] WHERE ISDESCENDANTNODE('/users') AND localname() LIKE '${PREFIX}%'`
        }
    }).then(({data}) => {
        data.jcr.sites.nodes.forEach(({name}) => deleteSite(name));
        data.jcr.users.nodes.forEach(({name}) => deleteUser(name));
    });
};

const createEditorSite = (site: string, user: string) => {
    createSite(site);
    addNode({parentPathOrId: homePath(site), name: AREA, primaryNodeType: 'jnt:contentList'});
    grantRoles(`/sites/${site}`, ['editor-in-chief'], user, 'USER');
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

// Every site is published once its content exists, so a cut news is live at its source before it moves.
const createFixture = (f: Fixture, sites: string[], withSubPage: boolean) => {
    createUser(f.user, PASSWORD);
    sites.forEach(site => createEditorSite(site, f.user));
    if (withSubPage) {
        addSubPage(f);
    }

    addNode({
        parentPathOrId: homeArea(f.siteA),
        name: f.news,
        primaryNodeType: 'jnt:news',
        properties: [
            {name: 'jcr:title', value: f.newsTitle, language: 'en'},
            {name: 'desc', value: `<p>Body of ${f.newsTitle}</p>`, language: 'en'}
        ]
    });
    sites.forEach(publishSite);
};

const deleteFixture = (f: Fixture, sites: string[]) => {
    cy.logout();
    sites.forEach(site => deleteSite(site));
    deleteUser(f.user);
};

// Registers the hooks of one journey, on site A alone or on sites A and B, and returns its fixture.
const useFixture = ({crossSite}: {crossSite: boolean}): Fixture => {
    const f = newFixture();
    const sites = crossSite ? [f.siteA, f.siteB] : [f.siteA];
    before(() => createFixture(f, sites, !crossSite));
    after(() => deleteFixture(f, sites));
    beforeEach(() => cy.login(f.user, PASSWORD));
    return f;
};

// The legacy test publishes the whole site here. Only the file and its reference are published, so the news
// that the first test of the journey pasted or cut stays unpublished until the publication under test.
const addPublishedFileReference = (f: Fixture) => {
    const filePath = `/sites/${f.siteA}/files/${f.fileName}`;
    uploadFile('/assets/uploadMedia/myfile.pdf', `/sites/${f.siteA}/files`, f.fileName, 'application/pdf');
    addNode({
        parentPathOrId: homeArea(f.siteA),
        name: f.fileRef,
        primaryNodeType: 'jnt:fileReference',
        properties: [{name: 'j:node', value: filePath, type: 'REFERENCE'}]
    });
    publish(filePath);
    publish(`${homeArea(f.siteA)}/${f.fileRef}`);
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

// The UUID of the source is kept, so that the paste can tell a move from a duplicate.
const putInClipboard = (jcontent: JContentPageBuilder, path: string, role: Role) => {
    getNodeByPath(path).its('data.jcr.nodeByPath.uuid').as('sourceUuid');
    // Not forced, or the right-click may open the context menu of the page
    jcontent.getModule(path, false).contextMenu(true, false).selectByRole(role);
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

// A cut moves the node and keeps its identity, so references to it survive. A copy is a new node.
const shouldKeepIdentity = (path: string, role: Role) => {
    cy.get<string>('@sourceUuid').then(sourceUuid => {
        getNodeByPath(path).its('data.jcr.nodeByPath.uuid').should(role === 'cut' ? 'eq' : 'not.eq', sourceUuid);
    });
};

type Item = 'news' | 'fileRef';

// What shows that a module renders its item: the title of the news, or the link of the file reference.
const shouldRenderItem = (module: JQuery, f: Fixture, item: Item) => {
    if (item === 'news') {
        expect(module).to.contain(f.newsTitle);
    } else {
        expect(module.find(`a[href*="${f.fileName}"]`)).to.have.length.greaterThan(0);
    }
};

// Opens the page anew: after a paste, the frame of Page Builder reloads under the alias of the old one.
const shouldShowModule = ({site, page, path}: {site: string; page: string; path: string}, f: Fixture, item: Item) => {
    openPageBuilder(site, page).getModule(path).get().should(module => shouldRenderItem(module, f, item));
};

// The area renders before the absence is read, so an empty frame cannot pass.
const shouldNotShowModule = (site: string, areaPath: string, path: string) => {
    const jcontent = openPageBuilder(site);
    jcontent.getModule(areaPath);
    jcontent.iframe().get().find(`[jahiatype="module"][path="${path}"]`).should('not.exist');
};

// The steps the edit-mode tests share: copy or cut an item of the home page of site A, paste it on the
// sub-page or on site B, then check the pasted node in Page Builder, and the source both in Page Builder
// and in the repository.
const transfer = (f: Fixture, role: Role, item: Item, {crossSite}: {crossSite: boolean}) => {
    const name = item === 'news' ? f.news : f.fileRef;
    const source = `${homeArea(f.siteA)}/${name}`;
    const targetArea = crossSite ? homeArea(f.siteB) : subPageArea(f);
    const target = `${targetArea}/${name}`;

    const jcontent = openPageBuilder(f.siteA);
    putInClipboard(jcontent, source, role);
    pasteInto(crossSite ? switchSite(jcontent, f.siteB) : openSubPage(jcontent, f), targetArea);
    shouldKeepIdentity(target, role);
    shouldShowModule({
        site: crossSite ? f.siteB : f.siteA,
        page: crossSite ? 'home' : `home/${f.subPage}`,
        path: target
    }, f, item);
    if (role === 'copy') {
        shouldShowModule({site: f.siteA, page: 'home', path: source}, f, item);
    } else {
        shouldNotShowModule(f.siteA, homeArea(f.siteA), source);
    }

    GraphqlUtils.getNode(source).should(role === 'copy' ? 'exist' : 'not.exist');
};

type Workspace = 'live' | 'default';

// What a rendered page shows.
type Shown = {news: boolean; fileRef: boolean};

const BOTH: Shown = {news: true, fileRef: true};
const NONE: Shown = {news: false, fileRef: false};

// The home link of the navigation proves that the page rendered, before an absence is read.
const shouldHaveRendered = (site: string) => {
    cy.get(`a[href$="/sites/${site}/home.html"]`).should('exist');
};

const visitRendered = (workspace: Workspace, site: string) => {
    cy.visit(`/cms/render/${workspace}/en/sites/${site}/home.html`);
    shouldHaveRendered(site);
};

const shouldRender = (f: Fixture, shown: Shown) => {
    cy.get('body').should(shown.news ? 'contain' : 'not.contain', f.newsTitle);
    cy.get(`a[href*="${f.fileName}"]`).should(shown.fileRef ? 'exist' : 'not.exist');
};

// Live is read as a visitor, since publication is what makes content public. Preview needs the editor.
const asVisitor = () => cy.logout();

// The sub-page is opened from the navigation of the home page, as the legacy test did.
const checkSameSite = (workspace: Workspace, f: Fixture, home: Shown, subPage: Shown) => {
    visitRendered(workspace, f.siteA);
    shouldRender(f, home);
    cy.contains('a', f.subPageTitle).click({force: true});
    cy.url().should('contain', `/${f.subPage}.html`);
    shouldHaveRendered(f.siteA);
    shouldRender(f, subPage);
};

const checkCrossSite = (workspace: Workspace, f: Fixture, siteA: Shown, siteB: Shown) => {
    visitRendered(workspace, f.siteA);
    shouldRender(f, siteA);
    visitRendered(workspace, f.siteB);
    shouldRender(f, siteB);
};

describe('Page builder - copy, cut and paste content', () => {
    before(() => {
        removeStaleFixtures();
    });

    describe('Copy on the same site', () => {
        const f = useFixture({crossSite: false});

        it('FT-001: Copied news is pasted on another page of the same site', () => {
            context.tag('copy-paste', 'same-site', 'news', 'edit-mode', 'testrail-case-2924367');
            transfer(f, 'copy', 'news', {crossSite: false});
        });

        describe('once a published file reference is on the home page', () => {
            before(() => addPublishedFileReference(f));

            it('FT-002: Copied file reference is pasted on another page of the same site', () => {
                context.tag('copy-paste', 'same-site', 'file-reference', 'edit-mode', 'testrail-case-2924367');
                transfer(f, 'copy', 'fileRef', {crossSite: false});
            });

            it('FT-004: Copies on the same site are rendered in preview before publication', () => {
                context.tag('copy-paste', 'same-site', 'preview-mode', 'testrail-case-2924367');
                checkSameSite('default', f, BOTH, BOTH);
                asVisitor();
                checkSameSite('live', f, BOTH, NONE);
            });

            describe('once site A is published', () => {
                before(() => publishSite(f.siteA));

                it('FT-003: Copies on the same site are rendered in live after publication', () => {
                    context.tag('copy-paste', 'same-site', 'live-mode', 'testrail-case-2924367');
                    asVisitor();
                    checkSameSite('live', f, BOTH, BOTH);
                });
            });
        });
    });

    describe('Cut on the same site', () => {
        const f = useFixture({crossSite: false});

        it('FT-005: Cut news is moved to another page of the same site', () => {
            context.tag('cut-paste', 'same-site', 'news', 'edit-mode', 'testrail-case-2924368');
            transfer(f, 'cut', 'news', {crossSite: false});
        });

        describe('once a published file reference is on the home page', () => {
            before(() => addPublishedFileReference(f));

            it('FT-006: Cut file reference is moved to another page of the same site', () => {
                context.tag('cut-paste', 'same-site', 'file-reference', 'edit-mode', 'testrail-case-2924368');
                transfer(f, 'cut', 'fileRef', {crossSite: false});
            });

            it('FT-008: Cut content on the same site is moved in preview before publication', () => {
                context.tag('cut-paste', 'same-site', 'preview-mode', 'testrail-case-2924368');
                checkSameSite('default', f, NONE, BOTH);
                asVisitor();
                checkSameSite('live', f, BOTH, NONE);
            });

            describe('once site A is published', () => {
                before(() => publishSite(f.siteA));

                it('FT-007: Cut content on the same site is moved in live after publication', () => {
                    context.tag('cut-paste', 'same-site', 'live-mode', 'testrail-case-2924368');
                    asVisitor();
                    checkSameSite('live', f, NONE, BOTH);
                });
            });
        });
    });

    describe('Copy to another site', () => {
        const f = useFixture({crossSite: true});

        it('FT-009: Copied news is pasted on another site', () => {
            context.tag('copy-paste', 'cross-site', 'news', 'edit-mode', 'testrail-case-2924369');
            transfer(f, 'copy', 'news', {crossSite: true});
        });

        describe('once a published file reference is on the home page of site A', () => {
            before(() => addPublishedFileReference(f));

            it('FT-010: Copied file reference is pasted on another site', () => {
                context.tag('copy-paste', 'cross-site', 'file-reference', 'edit-mode', 'testrail-case-2924369');
                transfer(f, 'copy', 'fileRef', {crossSite: true});
            });

            it('FT-012: Cross-site copies are rendered in preview before publication', () => {
                context.tag('copy-paste', 'cross-site', 'preview-mode', 'testrail-case-2924369');
                checkCrossSite('default', f, BOTH, BOTH);
                asVisitor();
                checkCrossSite('live', f, BOTH, NONE);
            });

            describe('once site B is published', () => {
                before(() => publishSite(f.siteB));

                it('FT-011: Cross-site copies are rendered in live after publication', () => {
                    context.tag('copy-paste', 'cross-site', 'live-mode', 'testrail-case-2924369');
                    asVisitor();
                    checkCrossSite('live', f, BOTH, BOTH);
                });
            });
        });
    });

    describe('Cut to another site', () => {
        const f = useFixture({crossSite: true});

        it('FT-013: Cut news is moved to another site', () => {
            context.tag('cut-paste', 'cross-site', 'news', 'edit-mode', 'testrail-case-2924370');
            transfer(f, 'cut', 'news', {crossSite: true});
        });

        describe('once a published file reference is on the home page of site A', () => {
            before(() => addPublishedFileReference(f));

            it('FT-014: Cut file reference is moved to another site', () => {
                context.tag('cut-paste', 'cross-site', 'file-reference', 'edit-mode', 'testrail-case-2924370');
                transfer(f, 'cut', 'fileRef', {crossSite: true});
            });

            it('FT-016: Cross-site cut content is moved in preview before publication', () => {
                context.tag('cut-paste', 'cross-site', 'preview-mode', 'testrail-case-2924370');
                checkCrossSite('default', f, NONE, BOTH);
                asVisitor();
                checkCrossSite('live', f, BOTH, NONE);
            });

            describe('once site B, then site A, are published', () => {
                before(() => {
                    publishSite(f.siteB);
                    publishSite(f.siteA);
                });

                it('FT-015: Cross-site cut content is moved in live after publication', () => {
                    context.tag('cut-paste', 'cross-site', 'live-mode', 'testrail-case-2924370');
                    asVisitor();
                    checkCrossSite('live', f, NONE, BOTH);
                });
            });
        });
    });
});
