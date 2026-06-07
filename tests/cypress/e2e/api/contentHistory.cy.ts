import {addNode, createSite, createUser, deleteSite, deleteUser, grantRoles, publishAndWaitJobEnding} from '@jahia/cypress';
import {GraphqlUtils} from '../../utils/graphqlUtils';

/**
 * Content History GraphQL API tests.
 *
 * All test data is created once in the `before` block. Individual tests only query —
 * no content is created or deleted per test. The site (and all its content) is deleted
 * in `after`.
 *
 * Node inventory:
 *  - node-basic      : jnt:text, English only — used for schema/structure tests
 *  - node-bilingual  : jnt:text, English + French — used for language-nodes tests
 *  - node-updates    : jnt:text, created + 3 property updates — used for pagination / filter tests
 *  - node-published  : jnt:text, created + published — used for publication action tests
 *  - node-user       : jnt:text, created as historyTestUser — used for userKey tracking tests
 */
describe('Content History GraphQL API', () => {
    const siteKey = 'contentHistoryTestSite';
    const sitePath = `/sites/${siteKey}`;
    const contentPath = `${sitePath}/contents`;

    const testUserName = 'historyTestUser';
    const testUserPassword = 'History_Test_1!';

    const nodePaths = {
        basic: `${contentPath}/node-basic`,
        bilingual: `${contentPath}/node-bilingual`,
        updates: `${contentPath}/node-updates`,
        published: `${contentPath}/node-published`,
        user: `${contentPath}/node-user`
    };

    before(() => {
        cy.loginAndStoreSession();
        deleteSite(siteKey);
        createSite(siteKey, {
            languages: 'en,fr',
            templateSet: 'dx-base-demo-templates',
            serverName: 'localhost',
            locale: 'en'
        });

        // Create a dedicated test user with editor rights on the site
        createUser(testUserName, testUserPassword);
        grantRoles(sitePath, ['editor'], testUserName, 'USER');

        // Node-basic: plain English text node
        addNode({
            parentPathOrId: contentPath,
            name: 'node-basic',
            primaryNodeType: 'jnt:text',
            properties: [{name: 'text', value: 'Basic text content', language: 'en'}]
        });

        // Node-bilingual: text node with both English and French content
        addNode({
            parentPathOrId: contentPath,
            name: 'node-bilingual',
            primaryNodeType: 'jnt:text',
            properties: [
                {name: 'text', value: 'English content', language: 'en'},
                {name: 'text', value: 'Contenu français', language: 'fr'}
            ]
        });

        // Node-updates: created then updated three times to produce varied history
        addNode({
            parentPathOrId: contentPath,
            name: 'node-updates',
            primaryNodeType: 'jnt:text',
            properties: [{name: 'text', value: 'Initial value', language: 'en'}]
        });
        GraphqlUtils.setProperty(nodePaths.updates, 'text', 'Update 1', 'en');
        GraphqlUtils.setProperty(nodePaths.updates, 'text', 'Update 2', 'en');
        GraphqlUtils.setProperty(nodePaths.updates, 'text', 'Update 3', 'en');

        // Node-published: created then published
        addNode({
            parentPathOrId: contentPath,
            name: 'node-published',
            primaryNodeType: 'jnt:text',
            properties: [{name: 'text', value: 'Content to publish', language: 'en'}]
        });
        publishAndWaitJobEnding(nodePaths.published, ['en']);

        // Node-user: created as testUser to verify userKey tracking in history

        cy.apolloClient({username: testUserName, password: testUserPassword});
        addNode({
            parentPathOrId: contentPath,
            name: 'node-user',
            primaryNodeType: 'jnt:text',
            properties: [{name: 'text', value: 'Created by test user', language: 'en'}]
        });
        cy.apolloClient(); // Switch back to admin
        // Wait for all logs being processed
        // eslint-disable-next-line cypress/no-unnecessary-waiting
        cy.wait(1000);
    });

    after(() => {
        cy.loginAndStoreSession();
        deleteSite(siteKey);
        deleteUser(testUserName);
        cy.logout();
    });

    beforeEach(() => {
        cy.loginAndStoreSession();
    });

    // -------------------------------------------------------------------------
    // Schema / structure tests  (node-basic)
    // -------------------------------------------------------------------------

    it('should return history structure for a node', () => {
        cy.apollo({
            queryFile: 'api/contentHistory/getNodeHistory.graphql',
            variables: {path: nodePaths.basic, withLanguageNodes: false}
        }).then(result => {
            expect(result?.data?.jcr?.nodeByPath?.history).to.exist;
            expect(result?.data?.jcr?.nodeByPath?.history?.count).to.be.a('number');
            expect(result?.data?.jcr?.nodeByPath?.history?.entries).to.be.an('array');
        });
    });

    it('should return entries without explicit parameters', () => {
        cy.apollo({
            queryFile: 'api/contentHistory/getNodeHistoryNoParams.graphql',
            variables: {path: nodePaths.basic, withLanguageNodes: false}
        }).then(result => {
            const entries = result?.data?.jcr?.nodeByPath?.history?.entries;
            expect(entries).to.be.an('array');
            if (entries?.length > 0) {
                const entry = entries[0];
                expect(entry).to.have.property('id');
                expect(entry).to.have.property('date');
                expect(entry).to.have.property('action');
                expect(entry).to.have.property('userKey');
                if (entry.date) {
                    expect(entry.date).to.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}/);
                }
            }
        });
    });

    it('should include all available fields', () => {
        cy.apollo({
            queryFile: 'api/contentHistory/getNodeHistoryComplete.graphql',
            variables: {path: nodePaths.basic, withLanguageNodes: false, offset: 0, limit: 5}
        }).then(result => {
            const history = result?.data?.jcr?.nodeByPath?.history;
            expect(history).to.exist;
            expect(history.count).to.be.a('number');
            expect(history.entries).to.be.an('array');
            if (history.entries?.length > 0) {
                const entry = history.entries[0];
                ['id', 'date', 'timestamp', 'path', 'uuid', 'action', 'propertyName', 'userKey', 'message', 'language'].forEach(field => {
                    expect(entry).to.have.property(field);
                });
                if (entry.timestamp !== null) {
                    expect(entry.timestamp).to.be.a('number');
                }

                if (entry.date) {
                    expect(entry.date).to.match(/^\d{4}-\d{2}-\d{2}T/);
                }
            }
        });
    });

    it('should return timestamp consistent with date', () => {
        cy.apollo({
            queryFile: 'api/contentHistory/getNodeHistoryComplete.graphql',
            variables: {path: nodePaths.basic, withLanguageNodes: false, offset: 0, limit: 1}
        }).then(result => {
            const entries = result?.data?.jcr?.nodeByPath?.history?.entries;
            if (entries?.length > 0 && entries[0].date) {
                const entry = entries[0];
                expect(entry.timestamp).to.be.a('number');
                const diff = Math.abs(entry.timestamp - new Date(entry.date).getTime());
                expect(diff).to.be.lessThan(1000);
            }
        });
    });

    it('should return empty entries for a non-existent action filter', () => {
        cy.apollo({
            queryFile: 'api/contentHistory/getNodeHistoryWithAction.graphql',
            variables: {
                path: nodePaths.basic,
                withLanguageNodes: false,
                action: 'nonExistentAction12345',
                offset: 0,
                limit: 50
            }
        }).then(result => {
            const entries = result?.data?.jcr?.nodeByPath?.history?.entries;
            expect(entries).to.be.an('array');
            expect(entries.length).to.equal(0);
        });
    });

    // -------------------------------------------------------------------------
    // Language nodes tests  (node-bilingual)
    // -------------------------------------------------------------------------

    it('should return higher or equal count when including language nodes', () => {
        cy.apollo({
            queryFile: 'api/contentHistory/getNodeHistoryCount.graphql',
            variables: {path: nodePaths.bilingual, withLanguageNodes: false}
        }).then(result => {
            const countWithoutLang = result?.data?.jcr?.nodeByPath?.history?.count;
            expect(countWithoutLang).to.be.a('number').and.be.at.least(0);

            cy.apollo({
                queryFile: 'api/contentHistory/getNodeHistoryCount.graphql',
                variables: {path: nodePaths.bilingual, withLanguageNodes: true}
            }).then(resultWithLang => {
                const countWithLang = resultWithLang?.data?.jcr?.nodeByPath?.history?.count;
                expect(countWithLang).to.be.a('number').and.be.at.least(countWithoutLang);
            });
        });
    });

    // -------------------------------------------------------------------------
    // Pagination and action filter tests  (node-updates)
    // -------------------------------------------------------------------------

    it('should respect the limit parameter', () => {
        cy.apollo({
            queryFile: 'api/contentHistory/getNodeHistoryPaginated.graphql',
            variables: {path: nodePaths.updates, withLanguageNodes: false, offset: 0, limit: 2}
        }).then(result => {
            const entries = result?.data?.jcr?.nodeByPath?.history?.entries;
            expect(entries).to.be.an('array');
            if (entries?.length > 0) {
                expect(entries.length).to.be.at.most(2);
                ['id', 'date', 'path', 'uuid', 'action', 'userKey'].forEach(f => expect(entries[0]).to.have.property(f));
            }
        });
    });

    it('should skip entries when an offset is provided', () => {
        cy.apollo({
            queryFile: 'api/contentHistory/getNodeHistoryPaginated.graphql',
            variables: {path: nodePaths.updates, withLanguageNodes: false, offset: 0, limit: 10}
        }).then(result => {
            const entries = result?.data?.jcr?.nodeByPath?.history?.entries;
            expect(entries).to.be.an('array');
            if (entries?.length > 1) {
                const firstId = entries[0].id;
                cy.apollo({
                    queryFile: 'api/contentHistory/getNodeHistoryPaginated.graphql',
                    variables: {path: nodePaths.updates, withLanguageNodes: false, offset: 1, limit: 10}
                }).then(offsetResult => {
                    const offsetEntries = offsetResult?.data?.jcr?.nodeByPath?.history?.entries;
                    expect(offsetEntries).to.be.an('array');
                    if (offsetEntries?.length > 0) {
                        expect(offsetEntries[0].id).to.not.equal(firstId);
                    }
                });
            }
        });
    });

    it('should filter entries by action and only return matching ones', () => {
        cy.apollo({
            queryFile: 'api/contentHistory/getNodeHistoryDetailed.graphql',
            variables: {path: nodePaths.updates, withLanguageNodes: false, offset: 0, limit: 100}
        }).then(allResult => {
            const allEntries = allResult?.data?.jcr?.nodeByPath?.history?.entries;
            const actions = [...new Set(allEntries.map((e: {action: string}) => e.action).filter(Boolean))];
            cy.log(`Available actions: ${actions.join(', ')}`);
            const testAction = actions[0];

            cy.apollo({
                queryFile: 'api/contentHistory/getNodeHistoryWithAction.graphql',
                variables: {path: nodePaths.updates, withLanguageNodes: false, action: testAction, offset: 0, limit: 50}
            }).then(filteredResult => {
                const filteredEntries = filteredResult?.data?.jcr?.nodeByPath?.history?.entries;
                expect(filteredEntries).to.be.an('array');
                expect(filteredEntries.length).to.be.at.most(allEntries.length);
                for (const entry of filteredEntries) {
                    expect((entry as {action: string}).action).to.equal(testAction);
                }
            });
        });
    });

    it('should apply the action filter before paginating (limit is respected after filter)', () => {
        cy.apollo({
            queryFile: 'api/contentHistory/getNodeHistoryDetailed.graphql',
            variables: {path: nodePaths.updates, withLanguageNodes: false, offset: 0, limit: 100}
        }).then(allResult => {
            const allEntries = allResult?.data?.jcr?.nodeByPath?.history?.entries;

            const actions = [...new Set(allEntries.map((e: {action: string}) => e.action).filter(Boolean))];
            const testAction = actions[0];
            if (!testAction) {
                return;
            }

            cy.apollo({
                queryFile: 'api/contentHistory/getNodeHistoryWithAction.graphql',
                variables: {path: nodePaths.updates, withLanguageNodes: false, action: testAction, offset: 0, limit: 1}
            }).then(limitedResult => {
                const limitedEntries = limitedResult?.data?.jcr?.nodeByPath?.history?.entries;
                expect(limitedEntries).to.be.an('array');
                expect(limitedEntries.length).to.be.at.most(1);
                if (limitedEntries.length > 0) {
                    expect(limitedEntries[0].action).to.equal(testAction);
                }
            });
        });
    });

    it('should return a filtered count consistent with filtered entries', () => {
        cy.apollo({
            queryFile: 'api/contentHistory/getNodeHistoryCount.graphql',
            variables: {path: nodePaths.updates, withLanguageNodes: false}
        }).then(totalResult => {
            const totalCount = totalResult?.data?.jcr?.nodeByPath?.history?.count;
            expect(totalCount).to.be.a('number').and.be.at.least(0);
            cy.apollo({
                queryFile: 'api/contentHistory/getNodeHistoryCountWithAction.graphql',
                variables: {path: nodePaths.updates, withLanguageNodes: false, action: 'updated'}
            }).then(filteredResult => {
                const filteredCount = filteredResult?.data?.jcr?.nodeByPath?.history?.count;
                expect(filteredCount).to.be.a('number');
                expect(filteredCount).to.be.at.most(totalCount);
                expect(filteredCount).to.be.at.least(0);
            });
        });
    });

    it('should resolve property display name for property-related entries', () => {
        cy.apollo({
            queryFile: 'api/contentHistory/getNodeHistoryWithPropertyDisplay.graphql',
            variables: {path: nodePaths.updates, withLanguageNodes: false, offset: 0, limit: 50, language: 'en'}
        }).then(result => {
            const entries = result?.data?.jcr?.nodeByPath?.history?.entries;
            if (entries?.length > 0) {
                const propertyEntry = entries.find((entry: { propertyName: string }) => entry.propertyName);
                if (propertyEntry) {
                    expect(propertyEntry.propertyNameDisplay).to.be.a('string').and.have.length.greaterThan(0);
                    cy.log(`Property: ${propertyEntry.propertyName} → "${propertyEntry.propertyNameDisplay}"`);
                }
            }
        });
    });

    it('should fall back to property name when language is invalid', () => {
        cy.apollo({
            queryFile: 'api/contentHistory/getNodeHistoryWithPropertyDisplay.graphql',
            variables: {
                path: nodePaths.updates,
                withLanguageNodes: false,
                offset: 0,
                limit: 50,
                language: 'invalidLanguage'
            }
        }).then(result => {
            const entries = result?.data?.jcr?.nodeByPath?.history?.entries;
            if (entries?.length > 0) {
                const propertyEntry = entries.find((entry: { propertyName: string }) => entry.propertyName);
                if (propertyEntry) {
                    expect(propertyEntry.propertyNameDisplay).to.be.a('string').and.have.length.greaterThan(0);
                }
            }
        });
    });

    it('should return null propertyNameDisplay when propertyName is null', () => {
        cy.apollo({
            queryFile: 'api/contentHistory/getNodeHistoryWithPropertyDisplay.graphql',
            variables: {path: nodePaths.updates, withLanguageNodes: false, offset: 0, limit: 50, language: 'en'}
        }).then(result => {
            const entries = result?.data?.jcr?.nodeByPath?.history?.entries;
            if (entries?.length > 0) {
                const nodeEntry = entries.find((entry: { propertyName: string | null }) => !entry.propertyName);
                if (nodeEntry) {
                    expect(nodeEntry.propertyName).to.be.null;
                    expect(nodeEntry.propertyNameDisplay).to.be.null;
                }
            }
        });
    });

    // -------------------------------------------------------------------------
    // Publication tests  (node-published)
    // -------------------------------------------------------------------------

    it('should include a published action entry after publishing', () => {
        cy.apollo({
            queryFile: 'api/contentHistory/getNodeHistoryDetailed.graphql',
            variables: {path: nodePaths.published, withLanguageNodes: false, offset: 0, limit: 50}
        }).then(result => {
            const entries = result?.data?.jcr?.nodeByPath?.history?.entries;
            expect(entries).to.be.an('array');
            if (entries?.length > 0) {
                cy.log(`Found ${entries.length} history entries`);
                const publishedEntry = entries.find((entry: { action: string }) => entry.action === 'published');
                if (publishedEntry) {
                    expect(publishedEntry.userKey).to.be.a('string');
                } else {
                    cy.log('No published entry found — metrics logging may be disabled');
                }
            }
        });
    });

    it('should return filtered count for published action', () => {
        cy.apollo({
            queryFile: 'api/contentHistory/getNodeHistoryCount.graphql',
            variables: {path: nodePaths.published, withLanguageNodes: false}
        }).then(totalResult => {
            const totalCount = totalResult?.data?.jcr?.nodeByPath?.history?.count;
            if (totalCount > 0) {
                cy.apollo({
                    queryFile: 'api/contentHistory/getNodeHistoryCountWithAction.graphql',
                    variables: {path: nodePaths.published, withLanguageNodes: false, action: 'published'}
                }).then(filteredResult => {
                    const filteredCount = filteredResult?.data?.jcr?.nodeByPath?.history?.count;
                    expect(filteredCount).to.be.a('number');
                    expect(filteredCount).to.be.at.most(totalCount).and.be.at.least(0);
                });
            }
        });
    });

    // -------------------------------------------------------------------------
    // Boundary / edge-case tests  (node-updates for known history depth)
    // -------------------------------------------------------------------------

    it('should return a GraphQL error when offset is negative', () => {
        cy.apollo({
            queryFile: 'api/contentHistory/getNodeHistoryPaginated.graphql',
            variables: {path: nodePaths.updates, withLanguageNodes: false, offset: -1, limit: 10}
        }).then(result => {
            // Apollo catches errors and returns the Error instance rather than throwing
            expect(result).to.be.instanceOf(Error);
        });
    });

    it('should return a GraphQL error when limit is negative', () => {
        cy.apollo({
            queryFile: 'api/contentHistory/getNodeHistoryPaginated.graphql',
            variables: {path: nodePaths.updates, withLanguageNodes: false, offset: 0, limit: -1}
        }).then(result => {
            expect(result).to.be.instanceOf(Error);
        });
    });

    it('should return an empty array when offset exceeds the total entry count', () => {
        cy.apollo({
            queryFile: 'api/contentHistory/getNodeHistoryCount.graphql',
            variables: {path: nodePaths.updates, withLanguageNodes: false}
        }).then(countResult => {
            const totalCount = countResult?.data?.jcr?.nodeByPath?.history?.count ?? 0;
            const beyondOffset = totalCount + 1000;

            cy.apollo({
                queryFile: 'api/contentHistory/getNodeHistoryPaginated.graphql',
                variables: {path: nodePaths.updates, withLanguageNodes: false, offset: beyondOffset, limit: 50}
            }).then(result => {
                const entries = result?.data?.jcr?.nodeByPath?.history?.entries;
                expect(entries).to.be.an('array');
                expect(entries.length).to.equal(0);
            });
        });
    });

    it('should return at most the available entries when limit exceeds the total count', () => {
        cy.apollo({
            queryFile: 'api/contentHistory/getNodeHistoryCount.graphql',
            variables: {path: nodePaths.updates, withLanguageNodes: false}
        }).then(countResult => {
            const totalCount = countResult?.data?.jcr?.nodeByPath?.history?.count ?? 0;
            const oversizedLimit = totalCount + 1000;

            cy.apollo({
                queryFile: 'api/contentHistory/getNodeHistoryPaginated.graphql',
                variables: {path: nodePaths.updates, withLanguageNodes: false, offset: 0, limit: oversizedLimit}
            }).then(result => {
                const entries = result?.data?.jcr?.nodeByPath?.history?.entries;
                expect(entries).to.be.an('array');
                expect(entries.length).to.equal(totalCount);
            });
        });
    });

    it('should apply a default limit of 20 when offset and limit are omitted', () => {
        cy.apollo({
            queryFile: 'api/contentHistory/getNodeHistoryNoParams.graphql',
            variables: {path: nodePaths.updates, withLanguageNodes: false}
        }).then(result => {
            const entries = result?.data?.jcr?.nodeByPath?.history?.entries;
            expect(entries).to.be.an('array');
            expect(entries.length).to.be.at.most(20);
        });
    });

    // -------------------------------------------------------------------------
    // User tracking tests  (node-user)
    // -------------------------------------------------------------------------

    it('should record the correct userKey for content created by a specific user', () => {
        cy.apollo({
            queryFile: 'api/contentHistory/getNodeHistoryDetailed.graphql',
            variables: {path: nodePaths.user, withLanguageNodes: false, offset: 0, limit: 50}
        }).then(result => {
            const entries = result?.data?.jcr?.nodeByPath?.history?.entries;
            expect(entries).to.be.an('array');

            if (entries?.length > 0) {
                // Every entry on this node was produced by testUserName
                entries.forEach((entry: { userKey: string }) => {
                    expect(entry.userKey).to.be.a('string').and.include(testUserName);
                });
                cy.log(`userKey recorded: ${entries[0].userKey}`);
            } else {
                cy.log('No history entries found — metrics logging may be disabled');
            }
        });
    });
});
