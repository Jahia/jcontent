import {getNodeByPath} from '@jahia/cypress';
import gql from 'graphql-tag';

export type EditorLockUser = {username: string; password: string};

// A failure is recorded once the promise of holdEditorLock has resolved, stopped once releaseEditorLock runs
export type EditorLockHolder = {
    socket: WebSocket;
    user: EditorLockUser;
    editorID: string;
    failure?: string;
    stopped?: boolean;
};

const unlockEditorMutation = gql`
    mutation unlockEditor($editorID: String!) {
        forms {
            unlockEditor(editorID: $editorID)
        }
    }
`;

// Cypress drives a single browser, so the open Content Editor of another user is the subscription that the
// editor opens when it mounts, opened as that user from the spec window, which outlives page visits.
// A later switch of session logs nobody out, so the subscription keeps its user.
// The socket speaks the subscriptions-transport-ws protocol (subprotocol graphql-ws, messages
// connection_init, start and stop), not graphql-transport-ws.
// subscribeToEditorLock sends no data, so the promise resolves on connection_ack, and a failure that
// comes later is recorded on the holder: read it with editorLockFailure when a lock poll fails.
export const holdEditorLock = (user: EditorLockUser, path: string, editorID: string): Cypress.Chainable<EditorLockHolder> => {
    cy.loginAndStoreSession(user.username, user.password);
    return getNodeByPath(path).then(result => new Cypress.Promise<EditorLockHolder>((resolve, reject) => {
        const socket = new WebSocket(`${Cypress.config('baseUrl').replace(/^http/, 'ws')}/modules/graphqlws`, 'graphql-ws');
        const holder: EditorLockHolder = {socket, user, editorID};
        let acknowledged = false;
        const fail = (failure: string) => {
            if (acknowledged) {
                holder.failure = holder.failure ?? failure;
            } else {
                reject(new Error(failure));
            }
        };

        socket.onerror = () => fail('the GraphQL websocket failed');
        socket.onclose = event => {
            if (!holder.stopped) {
                fail(`the GraphQL websocket closed early, with code ${event.code}`);
            }
        };

        socket.onopen = () => socket.send(JSON.stringify({type: 'connection_init', payload: {}}));
        socket.onmessage = event => {
            const message = JSON.parse(event.data);
            if (message.type === 'connection_ack') {
                socket.send(JSON.stringify({
                    id: 'editorLock',
                    type: 'start',
                    payload: {
                        query: 'subscription($nodeId:String!, $editorID:String!) { subscribeToEditorLock(nodeId: $nodeId, editorID: $editorID) }',
                        variables: {nodeId: result.data.jcr.nodeByPath.uuid, editorID}
                    }
                }));
                acknowledged = true;
                resolve(holder);
            } else if (message.type === 'connection_error' || message.type === 'error') {
                fail(`the editor lock subscription failed: ${event.data}`);
            }
        };
    }));
};

// The server releases the lock of a closed subscription only when its heartbeat times out, so the
// holder unlocks first, as Content Editor does when it closes. The Apollo client is root's again afterwards.
export const releaseEditorLock = (holder: EditorLockHolder): void => {
    const {socket, user, editorID} = holder;
    cy.apolloClient({username: user.username, password: user.password});
    cy.apollo({mutation: unlockEditorMutation, variables: {editorID}}).then(() => {
        holder.stopped = true;
        if (socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({id: 'editorLock', type: 'stop'}));
        }

        socket.close();
    });
    cy.apolloClient();
};

export const editorLockFailure = (holder: EditorLockHolder): string | undefined => holder.failure &&
    `the lock holder of ${holder.user.username} failed: ${holder.failure}`;
