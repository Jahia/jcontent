import {ContentEditor, JContent} from '../../../page-object';
import {
    addNode,
    context,
    createSite,
    createUser,
    deleteSite,
    deleteUser,
    getNodeByPath,
    grantRoles,
    jfaker
} from '@jahia/cypress';
import gql from 'graphql-tag';

type User = {username: string; password: string};
type LockState = {lockedAndCannotBeEdited: boolean; engineLockOwners: string[]};

// Covers the lock that an open Content Editor holds (type "engine"), not the lock taken explicitly with
// lockNode() (type "user"), which lock.cy.ts covers. Both render the same "Locked by" badge.
describe('Content Editor lock', () => {
    const uniq = jfaker.string.alphanumeric({length: 8, casing: 'lower', safe: true});
    const siteKey = `editorLockSite${uniq}`;
    const contentName = 'lock-content';
    const contentPath = `/sites/${siteKey}/contents/${contentName}`;
    const editorInChief: User = {username: `eic${uniq}`, password: 'password'};
    const editor: User = {username: `editor${uniq}`, password: 'password'};
    const lockBadge = 'div[data-sel-role="lock-info-badge"]';
    const readOnlyBadge = 'div[data-sel-role="read-only-badge"]';

    const lockStateQuery = gql`
        query editorLockState($path: String!) {
            jcr {
                nodeByPath(path: $path) {
                    lockedAndCannotBeEdited
                    lockInfo {
                        details(language: "en") {
                            owner
                            type
                        }
                    }
                }
            }
        }
    `;

    // Sockets standing for the open editor of another user, see holdEditorLock
    let lockHolders: WebSocket[] = [];

    const lockStateAs = (user: User): Cypress.Chainable<LockState> => {
        cy.apolloClient({username: user.username, password: user.password});
        return cy.apollo({query: lockStateQuery, variables: {path: contentPath}}).then(result => {
            const node = result?.data?.jcr?.nodeByPath;
            const details: {owner: string; type: string}[] = [].concat(node?.lockInfo?.details ?? []);
            const state: LockState = {
                lockedAndCannotBeEdited: Boolean(node?.lockedAndCannotBeEdited),
                engineLockOwners: details.filter(detail => detail.type === 'engine').map(detail => detail.owner)
            };
            cy.apolloClient();
            return cy.wrap(state, {log: false});
        });
    };

    const waitForLockState = (user: User, predicate: (state: LockState) => boolean, message: string, timeout = 10000) => {
        cy.waitUntil(() => lockStateAs(user).then(predicate), {errorMsg: message, timeout, interval: 500});
    };

    const waitForEditorLockHeldBy = (owner: User, otherUser: User) => {
        waitForLockState(
            otherUser,
            state => state.lockedAndCannotBeEdited && state.engineLockOwners.includes(owner.username),
            `${contentPath} is not locked by the editor of ${owner.username} for ${otherUser.username}`
        );
    };

    const waitForLockReleased = (user: User, timeout?: number) => {
        waitForLockState(
            user,
            state => !state.lockedAndCannotBeEdited && state.engineLockOwners.length === 0,
            `${contentPath} is still locked for ${user.username}`,
            timeout
        );
    };

    // Cypress drives a single browser, so the open editor of another user is the subscription that the
    // editor opens when it mounts, opened as that user from the spec window, which outlives page visits.
    // The switch of session that follows logs nobody out, so the subscription keeps its user.
    const holdEditorLock = (holder: User, otherUser: User) => {
        cy.loginAndStoreSession(holder.username, holder.password);
        getNodeByPath(contentPath).then(result => new Cypress.Promise<WebSocket>((resolve, reject) => {
            const socket = new WebSocket(`${Cypress.config('baseUrl').replace(/^http/, 'ws')}/modules/graphqlws`, 'graphql-ws');
            socket.onerror = () => reject(new Error('The GraphQL websocket failed'));
            socket.onopen = () => socket.send(JSON.stringify({type: 'connection_init', payload: {}}));
            socket.onmessage = event => {
                const message = JSON.parse(event.data);
                if (message.type === 'connection_ack') {
                    socket.send(JSON.stringify({
                        id: 'editorLock',
                        type: 'start',
                        payload: {
                            query: 'subscription($nodeId:String!, $editorID:String!) { subscribeToEditorLock(nodeId: $nodeId, editorID: $editorID) }',
                            variables: {nodeId: result.data.jcr.nodeByPath.uuid, editorID: `cypress${uniq}`}
                        }
                    }));
                    resolve(socket);
                } else if (message.type === 'connection_error' || message.type === 'error') {
                    reject(new Error(`The editor lock subscription failed: ${event.data}`));
                }
            };
        })).then(socket => {
            lockHolders.push(socket);
        });
        waitForEditorLockHeldBy(holder, otherUser);
    };

    const releaseEditorLocks = () => {
        lockHolders.forEach(socket => {
            if (socket.readyState === WebSocket.OPEN) {
                socket.send(JSON.stringify({id: 'editorLock', type: 'stop'}));
            }

            socket.close();
        });
        lockHolders = [];
    };

    const openEditorAs = (user: User): ContentEditor => {
        cy.loginAndStoreSession(user.username, user.password);
        JContent.visit(siteKey, 'en', 'content-folders/contents').editComponentByRowName(contentName);
        const contentEditor = new ContentEditor();
        contentEditor.switchToAdvancedMode();
        // The badges render with the form, so wait for it before asserting one is absent
        contentEditor.getSmallTextField('jnt:text_text').get().should('be.visible');
        return contentEditor;
    };

    const reopenEditor = (): ContentEditor => {
        new JContent().editComponentByRowName(contentName);
        const contentEditor = new ContentEditor();
        contentEditor.switchToAdvancedMode();
        contentEditor.getSmallTextField('jnt:text_text').get().should('be.visible');
        return contentEditor;
    };

    // Every name carries a suffix of its own run, so no earlier run leaves data to remove first
    before(() => {
        createSite(siteKey, {
            templateSet: 'dx-base-demo-templates',
            serverName: 'localhost',
            locale: 'en'
        });
        [editorInChief, editor].forEach(user => createUser(user.username, user.password));
        grantRoles(`/sites/${siteKey}`, ['editor-in-chief'], editorInChief.username, 'USER');
        grantRoles(`/sites/${siteKey}`, ['editor'], editor.username, 'USER');
        addNode({
            parentPathOrId: `/sites/${siteKey}/contents`,
            name: contentName,
            primaryNodeType: 'jnt:text',
            properties: [{name: 'text', value: 'Lock me', language: 'en'}]
        });
    });

    afterEach(() => {
        releaseEditorLocks();
        // Close the editor a test leaves open. No test edits a field, so Back closes it without a discard dialog
        cy.get('body').then($body => {
            if ($body.find(ContentEditor.defaultSelector).length > 0) {
                new ContentEditor().cancel();
            }
        });
        // The next test starts from a content that nobody locks, even after a failure
        waitForLockReleased(editor, 30000);
        // No cy.logout: it ends a server session that loginAndStoreSession restores without checking,
        // and a lock holder opened on that session would then connect as guest
    });

    after(() => {
        releaseEditorLocks();
        deleteSite(siteKey);
        deleteUser(editorInChief.username);
        deleteUser(editor.username);
    });

    it('locks the content for other users when Content Editor opens', () => {
        context.tag('content-editor', 'lock', 'concurrency');
        openEditorAs(editorInChief);
        waitForEditorLockHeldBy(editorInChief, editor);
    });

    it('does not block the user who opened Content Editor', () => {
        context.tag('content-editor', 'lock', 'badge');
        const contentEditor = openEditorAs(editorInChief);
        waitForEditorLockHeldBy(editorInChief, editor);

        lockStateAs(editorInChief).its('lockedAndCannotBeEdited').should('eq', false);
        cy.get(lockBadge).should('not.exist');
        cy.get(readOnlyBadge).should('not.exist');
        contentEditor.getSmallTextField('jnt:text_text').isNotReadOnly();
    });

    it('releases the lock when Content Editor is closed with Back', () => {
        context.tag('content-editor', 'lock', 'unlock', 'back');
        const contentEditor = openEditorAs(editorInChief);
        waitForEditorLockHeldBy(editorInChief, editor);

        contentEditor.cancel();

        waitForLockReleased(editorInChief);
        waitForLockReleased(editor);
    });

    it('releases the lock when the browser leaves Content Editor without closing it', () => {
        context.tag('content-editor', 'lock', 'unlock', 'heartbeat');
        openEditorAs(editorInChief);
        waitForEditorLockHeldBy(editorInChief, editor);

        cy.visit('/start');

        // The server releases the lock once the subscription of the editor is gone, 15 seconds at most
        waitForLockReleased(editorInChief, 30000);
        waitForLockReleased(editor, 30000);
    });

    it('shows a second user who holds the lock', () => {
        context.tag('content-editor', 'lock', 'concurrency', 'badge');
        holdEditorLock(editorInChief, editor);

        openEditorAs(editor);

        cy.get(lockBadge).should('be.visible').and('contain', `Locked by ${editorInChief.username}`);
    });

    it('shows no lock once the lock owner has closed their editor', () => {
        context.tag('content-editor', 'lock', 'unlock', 'badge');
        holdEditorLock(editorInChief, editor);
        const contentEditor = openEditorAs(editor);
        cy.get(lockBadge).should('be.visible').and('contain', `Locked by ${editorInChief.username}`);
        releaseEditorLocks();
        waitForLockReleased(editor);

        contentEditor.cancel();
        reopenEditor();

        cy.get(lockBadge).should('not.exist');
    });

    it('does not bring a released lock back on a page refresh', () => {
        context.tag('content-editor', 'lock', 'refresh', 'badge');
        holdEditorLock(editorInChief, editor);
        releaseEditorLocks();
        waitForLockReleased(editor);
        openEditorAs(editor).cancel();

        cy.reload();
        reopenEditor();

        cy.get(lockBadge).should('not.exist');
    });

    it('names whichever user holds the lock', () => {
        context.tag('content-editor', 'lock', 'concurrency', 'badge');
        holdEditorLock(editor, editorInChief);

        openEditorAs(editorInChief);

        cy.get(lockBadge).should('be.visible').and('contain', `Locked by ${editor.username}`);
    });
});
