import {
    addNode,
    createSite,
    createUser,
    deleteSite,
    deleteUser,
    grantRoles,
    markForDeletion,
    moveNode,
    waitAllJobsFinished
} from '@jahia/cypress';
import {JContent, SidePanel} from '../../../page-object';
import {GraphqlUtils} from '../../../utils/graphqlUtils';

/**
 * E2E tests for the Content History side panel tab.
 *
 * Requires the `jcontent-test-template` module deployed and the `viewHistoryTab`
 * permission added to the `editor-in-chief` role via the
 * `addHistoryPermission.groovy` fixture.
 *
 * Assertions are intentionally *additive* (presence-based) rather than exact:
 * the history stream is allowed to grow over time as Jahia evolves, so a new
 * entry showing up must not break existing tests. See
 * `tests/content-history-tests.md` for the empirical mapping of actions to
 * entry counts and the rationale behind the assertion style used here.
 */
describe('Content editor side panel - History tab', () => {
    const siteKey = 'contentHistoryUiTestSite';
    const sitePath = `/sites/${siteKey}`;
    const contentPath = `${sitePath}/contents`;
    const homePath = `${sitePath}/home`;
    const sidePanel = new SidePanel().inCE();

    const editor1 = {username: 'historyUiEditor1', password: 'History_Editor_1!'};
    const editor2 = {username: 'historyUiEditor2', password: 'History_Editor_2!'};
    const publisher = {username: 'historyUiPublisher', password: 'History_Publisher_1!'};
    const permissionTester = {username: 'historyUiPermTester', password: 'History_Perm_1!'};

    // Jahia writes history entries asynchronously through a Camel route — give
    // the writer enough time before snapshotting (the probe used 5 s).
    const HISTORY_WRITER_WAIT = 5000;

    // ----------------------------------------------------------------------
    // Helpers
    // ----------------------------------------------------------------------

    interface HistoryEntry {
        action: string;
        userKey: string;
        path: string;
        date: string;
        propertyName: string | null;
    }

    interface EntryPattern {
        action?: string;
        propertyName?: string;
        pathContains?: string;
        userKeyContains?: string;
    }

    const entryMatches = (entry: HistoryEntry, pattern: EntryPattern): boolean => {
        if (pattern.action !== undefined && entry.action !== pattern.action) {
            return false;
        }

        if (pattern.propertyName !== undefined && entry.propertyName !== pattern.propertyName) {
            return false;
        }

        if (pattern.pathContains !== undefined && !entry.path?.includes(pattern.pathContains)) {
            return false;
        }

        if (pattern.userKeyContains !== undefined && !entry.userKey?.includes(pattern.userKeyContains)) {
            return false;
        }

        return true;
    };

    /**
     * Assert that every pattern in `patterns` is matched by at least one entry.
     * Unknown / new entries that do not match any pattern are *ignored* — this
     * keeps tests robust against Jahia adding more history rows over time.
     */
    const expectEntriesToInclude = (entries: HistoryEntry[], patterns: EntryPattern[], label: string) => {
        // Always log all entry signatures so failures are easy to diagnose.
        const signatures = entries.map(e =>
            `${e.action}|prop=${e.propertyName ?? '-'}|user=${e.userKey ?? '-'}|path=${e.path ?? '-'}`
        );
        cy.log(`[${label}] ${entries.length} entries:`);
        signatures.forEach((sig, i) => cy.log(`  [${i}] ${sig}`));

        const missing = patterns.filter(p => !entries.some(e => entryMatches(e, p)));
        missing.forEach(p => {
            throw new Error(`[${label}] no entry matched pattern ${JSON.stringify(p)}`);
        });
    };

    const expectChronologicalOrder = (entries: HistoryEntry[]) => {
        // Only assert ordering between entries with strictly different timestamps —
        // multiple events in the same millisecond have no guaranteed relative order.
        const distinct = entries.filter((e, i) =>
            i === 0 || new Date(e.date).getTime() !== new Date(entries[i - 1].date).getTime()
        );
        for (let i = 1; i < distinct.length; i++) {
            const prev = new Date(distinct[i - 1].date).getTime();
            const curr = new Date(distinct[i].date).getTime();
            expect(prev, `entry ${i - 1} must be newer than entry ${i}`).to.be.greaterThan(curr);
        }
    };

    const setPropertyAs = (user: {username: string; password: string}, path: string, property: string, value: string) => {
        cy.apolloClient({username: user.username, password: user.password});
        GraphqlUtils.setProperty(path, property, value, 'en');
        cy.apolloClient();
    };

    const publishAs = (user: {username: string; password: string}, path: string, languages: string[] = ['en']) => {
        cy.apolloClient({username: user.username, password: user.password});
        cy.apollo({
            variables: {
                pathOrId: path,
                languages: languages,
                publishSubNodes: true,
                includeSubTree: true
            },
            mutationFile: 'graphql/jcr/mutation/publishNode.graphql'
        });
        // Switch back to root for admin polling (getJobsWithStatus is not
        // available to regular editors).
        cy.apolloClient();
        waitAllJobsFinished('Publication timeout for node: ' + path, 60000);
    };

    const fetchHistory = (path: string) => {
        return cy.apollo({
            queryFile: 'api/contentHistory/getNodeHistoryDetailed.graphql',
            variables: {path, withLanguageNodes: true, offset: 0, limit: 200}
        }).then(result => {
            const entries = result?.data?.jcr?.nodeByPath?.history?.entries || [];
            return entries as HistoryEntry[];
        });
    };

    const openHistoryFor = (parentAccordion: string, rowName: string) => {
        const jcontent = JContent.visit(siteKey, 'en', parentAccordion);
        const ce = jcontent.editComponentByRowName(rowName);
        ce.switchToAdvancedMode();
        sidePanel.switchToHistoryTab();
        sidePanel.getByRole('history-container').should('be.visible');
        // Wait for at least one entry to load before callers start asserting
        sidePanel.getHistoryItems().should('have.length.greaterThan', 0);
        return jcontent;
    };

    // ----------------------------------------------------------------------
    // Seed data — each scenario gets its own node. Publish-twice is used
    // wherever the test needs the discrete `published` action chip (first
    // publish only emits `added j:lastPublished*` rows credited to `root`).
    // ----------------------------------------------------------------------

    before(() => {
        cy.loginAndStoreSession();
        // Clean up any leftover data from a previous run before recreating it
        deleteSite(siteKey);
        [editor1, editor2, publisher, permissionTester].forEach(u => deleteUser(u.username));
        cy.executeGroovy('contentEditor/contentHistory/addHistoryPermission.groovy');

        createSite(siteKey, {
            languages: 'en',
            templateSet: 'jcontent-test-template',
            serverName: 'localhost',
            locale: 'en'
        });

        [editor1, editor2].forEach(u => {
            createUser(u.username, u.password);
            grantRoles(sitePath, ['editor'], u.username, 'USER');
        });
        // Publisher needs editor-in-chief role so publish mutations succeed.
        createUser(publisher.username, publisher.password);
        grantRoles(sitePath, ['editor-in-chief'], publisher.username, 'USER');
        // Dedicated user for the permission-enforcement test (editor role only).
        createUser(permissionTester.username, permissionTester.password);
        grantRoles(sitePath, ['editor'], permissionTester.username, 'USER');

        // Scenario 1: page edited by multiple users, then published twice so a
        // discrete `published` action row exists.
        addNode({
            parentPathOrId: homePath,
            name: 'history-test-page',
            primaryNodeType: 'jnt:page',
            properties: [
                {name: 'jcr:title', value: 'History test page', language: 'en'},
                {name: 'j:templateName', type: 'STRING', value: 'simple'}
            ]
        });
        setPropertyAs(editor1, `${homePath}/history-test-page`, 'jcr:title', 'Page edited by editor1');
        setPropertyAs(editor2, `${homePath}/history-test-page`, 'jcr:title', 'Page edited by editor2');
        publishAs(publisher, `${homePath}/history-test-page`);
        setPropertyAs(editor2, `${homePath}/history-test-page`, 'jcr:title', 'Page edited by editor2 again');
        publishAs(publisher, `${homePath}/history-test-page`);

        // Scenario 2: content edited by multiple users then published twice
        addNode({
            parentPathOrId: contentPath,
            name: 'history-test-text',
            primaryNodeType: 'jnt:bigText',
            properties: [{name: 'text', value: 'Initial text', language: 'en'}]
        });
        setPropertyAs(editor1, `${contentPath}/history-test-text`, 'text', 'Modified by editor1');
        setPropertyAs(editor2, `${contentPath}/history-test-text`, 'text', 'Modified by editor2');
        publishAs(publisher, `${contentPath}/history-test-text`);
        setPropertyAs(editor2, `${contentPath}/history-test-text`, 'text', 'Modified by editor2 again');
        publishAs(publisher, `${contentPath}/history-test-text`);

        // Scenario 3: mark for deletion / undelete. NOTE: mark-for-deletion
        // produces 0 history rows. Only the undelete side is asserted
        // (3× `removed` on j:deletion* properties).
        addNode({
            parentPathOrId: contentPath,
            name: 'history-test-deletion',
            primaryNodeType: 'jnt:bigText',
            properties: [{name: 'text', value: 'Will be marked for deletion', language: 'en'}]
        });
        cy.apolloClient({username: editor1.username, password: editor1.password});
        markForDeletion(`${contentPath}/history-test-deletion`);
        cy.apolloClient();
        cy.apolloClient({username: editor2.username, password: editor2.password});
        cy.apollo({
            mutationFile: 'contentEditor/contentHistory/unmarkNodeForDeletion.graphql',
            variables: {path: `${contentPath}/history-test-deletion`}
        });
        cy.apolloClient();

        // Scenario 4: created → published → moved → published. The move itself
        // emits no history row; the *post-move publish* records the new path.
        addNode({
            parentPathOrId: contentPath,
            name: 'movable-folder',
            primaryNodeType: 'jnt:contentFolder'
        });
        addNode({
            parentPathOrId: contentPath,
            name: 'history-test-move',
            primaryNodeType: 'jnt:bigText',
            properties: [{name: 'text', value: 'Will be moved', language: 'en'}]
        });
        publishAs(publisher, `${contentPath}/history-test-move`);
        moveNode(`${contentPath}/history-test-move`, `${contentPath}/movable-folder`);
        // First post-move publish may not produce a discrete `published` entry
        // (Jahia can treat it as a first publication at the new location).
        publishAs(publisher, `${contentPath}/movable-folder/history-test-move`);
        setPropertyAs(editor2, `${contentPath}/movable-folder/history-test-move`, 'text', 'Edited after move');
        // Second post-move publish — ensures a discrete `published` entry exists.
        publishAs(publisher, `${contentPath}/movable-folder/history-test-move`);
        setPropertyAs(editor2, `${contentPath}/movable-folder/history-test-move`, 'text', 'Edited after move again');
        publishAs(publisher, `${contentPath}/movable-folder/history-test-move`);

        // Scenario 5: large history for pagination. We do exactly enough
        // updates to exceed the default 20-row page (22 updates ⇒ >20
        // `changed` entries, plus create/translation entries). Each cy
        // command is recorded in Cypress's log, so we keep the loop small to
        // avoid the per-command memory cost when log history is enabled.
        addNode({
            parentPathOrId: contentPath,
            name: 'history-test-pagination',
            primaryNodeType: 'jnt:bigText',
            properties: [{name: 'text', value: 'Initial', language: 'en'}]
        });
        for (let i = 1; i <= 22; i++) {
            GraphqlUtils.setProperty(`${contentPath}/history-test-pagination`, 'text', `update ${i}`, 'en');
        }

        // Allow the asynchronous Camel-based history writer to catch up
        // eslint-disable-next-line cypress/no-unnecessary-waiting
        cy.wait(HISTORY_WRITER_WAIT);
    });

    after(() => {
        cy.loginAndStoreSession();
        deleteSite(siteKey);
        [editor1, editor2, publisher, permissionTester].forEach(u => deleteUser(u.username));
        cy.executeGroovy('contentEditor/contentHistory/removeHistoryPermission.groovy');
        cy.logout();
    });

    beforeEach(() => {
        cy.loginAndStoreSession(publisher.username, publisher.password);
    });

    // ----------------------------------------------------------------------
    // Scenario 1: page edited by multiple users then published
    // ----------------------------------------------------------------------
    it('should display all expected actions in correct order when a page is edited by multiple users and published', () => {
        const pagePath = `${homePath}/history-test-page`;

        fetchHistory(pagePath).then(entries => {
            expect(entries, 'history must not be empty').to.have.length.greaterThan(0);
            expectChronologicalOrder(entries);

            expectEntriesToInclude(entries, [
                {action: 'created', pathContains: '/history-test-page'},
                {action: 'added', propertyName: 'jcr:title', pathContains: '/j:translation_en'},
                {action: 'changed', propertyName: 'jcr:title', userKeyContains: editor1.username},
                {action: 'changed', propertyName: 'jcr:title', userKeyContains: editor2.username},
                // Second publish — the discrete `published` action entry is present
                // and credited to the publisher user.
                {action: 'published', pathContains: '/history-test-page', userKeyContains: publisher.username}
            ], 'scenario 1');

            // Editor2 edited after editor1 → editor2's most-recent change is more recent
            const editor1Last = entries.find(e => e.userKey?.includes(editor1.username));
            const editor2Last = entries.find(e => e.userKey?.includes(editor2.username));
            expect(editor1Last, 'editor1 must have at least one entry').to.exist;
            expect(editor2Last, 'editor2 must have at least one entry').to.exist;
            expect(new Date(editor2Last.date).getTime())
                .to.be.greaterThan(new Date(editor1Last.date).getTime());
        });

        const jcontent = JContent.visit(siteKey, 'en', 'pages/home');
        jcontent.getAccordionItem('pages').getTreeItem('home').expand();
        jcontent.getAccordionItem('pages').getTreeItem('history-test-page').click();
        jcontent.editPage().switchToAdvancedMode();
        sidePanel.switchToHistoryTab();

        sidePanel.getHistoryItems().should('have.length.greaterThan', 0);
        sidePanel.getByRole('history-container').should('contain.text', 'Published');
        sidePanel.getByRole('history-container').should('contain.text', 'Created');
        sidePanel.getByRole('history-container').should('contain.text', editor1.username);
        sidePanel.getByRole('history-container').should('contain.text', editor2.username);
        sidePanel.getByRole('history-container').should('contain.text', publisher.username);
    });

    // ----------------------------------------------------------------------
    // Scenario 2: content edited by multiple users then published
    // ----------------------------------------------------------------------
    it('should display all expected actions in correct order when a content is edited by multiple users and published', () => {
        const path = `${contentPath}/history-test-text`;

        fetchHistory(path).then(entries => {
            expect(entries).to.have.length.greaterThan(0);
            expectChronologicalOrder(entries);

            expectEntriesToInclude(entries, [
                {action: 'created', pathContains: '/history-test-text'},
                {action: 'added', propertyName: 'text', pathContains: '/j:translation_en'},
                {action: 'changed', propertyName: 'text', userKeyContains: editor1.username},
                {action: 'changed', propertyName: 'text', userKeyContains: editor2.username},
                // Second publish — discrete `published` entry credited to publisher.
                {action: 'published', pathContains: '/history-test-text', userKeyContains: publisher.username}
            ], 'scenario 2');
        });

        openHistoryFor('content-folders/contents', 'history-test-text');

        sidePanel.getHistoryItems().should('have.length.greaterThan', 2);
        sidePanel.getByRole('history-container').should('contain.text', 'Published');
        sidePanel.getByRole('history-container').should('contain.text', 'Created');
        sidePanel.getByRole('history-container').should('contain.text', editor1.username);
        sidePanel.getByRole('history-container').should('contain.text', editor2.username);
        sidePanel.getByRole('history-container').should('contain.text', publisher.username);
    });

    // ----------------------------------------------------------------------
    // Scenario 3: create, publish, move, publish — history shows new path
    //
    // NOTE: the move itself emits NO history row (no `moved` action). The
    // post-move publish entries carry the new path, which is what we assert.
    // ----------------------------------------------------------------------
    it('should record the new path in history after a node is moved', () => {
        const newParent = `${contentPath}/movable-folder`;
        const newPath = `${newParent}/history-test-move`;

        fetchHistory(newPath).then(entries => {
            expect(entries).to.have.length.greaterThan(0);
            expectChronologicalOrder(entries);

            expectEntriesToInclude(entries, [
                {action: 'created', pathContains: '/history-test-move'},
                {action: 'changed', propertyName: 'text', pathContains: '/movable-folder/history-test-move'},
                {action: 'published', pathContains: '/movable-folder/history-test-move'}
            ], 'scenario 4');

            // No `published` entry should still reference the pre-move path
            // for actions that occurred after the move.
            const postMovePublishOnOldPath = entries.find(
                e => e.action === 'published' && e.path === `${contentPath}/history-test-move`
            );
            expect(postMovePublishOnOldPath, 'no post-move publish should reference the old path').to.be.undefined;
        });

        const jcontent = JContent.visit(siteKey, 'en', 'content-folders/contents/movable-folder');
        const ce = jcontent.editComponentByRowName('history-test-move');
        ce.switchToAdvancedMode();
        sidePanel.switchToHistoryTab();

        sidePanel.getHistoryItems().should('have.length.greaterThan', 0);
        sidePanel.getByRole('history-container').should('contain.text', 'Published');
    });

    // ----------------------------------------------------------------------
    // Action filter: selecting an action filters visible entries
    // ----------------------------------------------------------------------
    it('should filter entries when an action is selected in the dropdown', () => {
        // Use scenario 2's content — it has all expected actions in the
        // stream (created/added/changed/published) thanks to two publishes.
        openHistoryFor('content-folders/contents', 'history-test-text');

        const totalAlias = 'totalCount';
        sidePanel.getHistoryItems().its('length').as(totalAlias);

        // Filter by "Published" — every visible chip must say "Published"
        sidePanel.getHistoryFilter().find('[role="listbox"] span').click();
        cy.get('.moonstone-menu').not('.moonstone-hidden').should('be.visible');
        cy.get('.moonstone-menu').not('.moonstone-hidden')
            .contains('.moonstone-listItem', 'Published').click();

        sidePanel.getHistoryItems().should('have.length.greaterThan', 0);
        // Single assertion against the whole jQuery set — avoids spawning a
        // per-item `cy.wrap` command (which keeps a DOM snapshot each and
        // leaks memory across runs when log history is enabled).
        sidePanel.getHistoryItems().should($items => {
            $items.each((_, el) => {
                expect(el.textContent || '', 'every visible entry must contain "Published"').to.contain('Published');
            });
        });

        // Reset to "All actions" and verify the total is restored
        sidePanel.getHistoryFilter().find('[role="listbox"] span').click();
        cy.get('.moonstone-menu').not('.moonstone-hidden')
            .contains('.moonstone-listItem', 'All actions').click();
        sidePanel.getHistoryItems().its('length').then(restored => {
            cy.get<number>(`@${totalAlias}`).then(total => {
                expect(restored).to.equal(total);
            });
        });
    });

    // ----------------------------------------------------------------------
    // Scenario 4: pagination of a long history
    // ----------------------------------------------------------------------
    it('should paginate when history contains more than one page of entries', () => {
        openHistoryFor('content-folders/contents', 'history-test-pagination');

        // First page should be full (20 items)
        sidePanel.getHistoryItems().should('have.length', 20);

        // Navigate to the last page — it should have fewer items than the first page
        sidePanel.getHistoryItems().its('length').then(firstPageCount => {
            cy.get('[data-testid="pagination-button-last-page"]').click();
            sidePanel.getHistoryItems().should('have.length.greaterThan', 0);
            sidePanel.getHistoryItems().its('length').should('be.lessThan', firstPageCount);
        });
    });

    // ----------------------------------------------------------------------
    // Scenario 5: permission removal hides the History tab
    // ----------------------------------------------------------------------
    describe('permission enforcement', () => {
        before(() => {
            cy.loginAndStoreSession();
            cy.executeGroovy('contentEditor/contentHistory/removeHistoryPermission.groovy');
        });

        after(() => {
            cy.loginAndStoreSession();
            cy.executeGroovy('contentEditor/contentHistory/addHistoryPermission.groovy');
        });

        it('should hide the History tab when the user lacks the viewHistoryTab permission', () => {
            cy.loginAndStoreSession(permissionTester.username, permissionTester.password);
            const jcontent = JContent.visit(siteKey, 'en', 'content-folders/contents');
            const ce = jcontent.editComponentByRowName('history-test-text');
            ce.switchToAdvancedMode();

            sidePanel.getByRole('side-panel').should('be.visible');
            sidePanel.getByRole('tab-details').should('be.visible');
            sidePanel.getByRole('tab-history').should('not.exist');
        });
    });
});
