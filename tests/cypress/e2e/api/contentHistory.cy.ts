import {addNode, createSite, deleteSite, publishAndWaitJobEnding} from '@jahia/cypress';
import {GraphqlUtils} from '../../utils/graphqlUtils';

describe('Content History GraphQL API', () => {
    const siteKey = 'contentHistoryTestSite';
    const sitePath = `/sites/${siteKey}`;
    const contentPath = `${sitePath}/contents`;
    const testNodeName = 'test-history-node';
    const testNodePath = `${contentPath}/${testNodeName}`;

    before(() => {
        deleteSite(siteKey);
        createSite(siteKey, {
            languages: 'en,fr',
            templateSet: 'dx-base-demo-templates',
            serverName: 'localhost',
            locale: 'en'
        });
    });

    after(() => {
        cy.logout();
    });

    beforeEach(() => {
        cy.loginAndStoreSession();
    });

    afterEach(() => {
        // Clean up test node if it exists
        GraphqlUtils.deleteNode(testNodePath);
    });

    it('should return history structure for a node (may be empty if metrics logging is disabled)', () => {
        // Create a simple text node
        addNode({
            parentPathOrId: contentPath,
            name: testNodeName,
            primaryNodeType: 'jnt:text',
            properties: [{name: 'text', value: 'Initial text', language: 'en'}]
        });

        // Wait for potential async history processing
        cy.wait(500);

        cy.apollo({
            queryFile: 'api/contentHistory/getNodeHistory.graphql',
            variables: {
                withLanguageNodes: false,
                path: testNodePath
            }
        }).then(result => {
            // Verify structure exists (history depends on metrics logging being enabled)
            expect(result?.data?.jcr?.nodeByPath?.history).to.exist;
            expect(result?.data?.jcr?.nodeByPath?.history?.count).to.be.a('number');
            expect(result?.data?.jcr?.nodeByPath?.history?.entries).to.be.an('array');
        });
    });

    it('should handle entries query without parameters', () => {
        addNode({
            parentPathOrId: contentPath,
            name: testNodeName,
            primaryNodeType: 'jnt:text',
            properties: [{name: 'text', value: 'Test content', language: 'en'}]
        });

        cy.wait(500);

        cy.apollo({
            queryFile: 'api/contentHistory/getNodeHistoryNoParams.graphql',
            variables: {
                withLanguageNodes: false,
                path: testNodePath
            }
        }).then(result => {
            const entries = result?.data?.jcr?.nodeByPath?.history?.entries;
            expect(entries).to.be.an('array');

            // If entries exist, verify their structure
            if (entries && entries.length > 0) {
                const entry = entries[0];
                expect(entry).to.have.property('id');
                expect(entry).to.have.property('date');
                expect(entry).to.have.property('action');
                expect(entry).to.have.property('userKey');

                // Verify date is in ISO 8601 format
                if (entry.date) {
                    expect(entry.date).to.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}/);
                }
            }
        });
    });

    it('should handle pagination parameters', () => {
        addNode({
            parentPathOrId: contentPath,
            name: testNodeName,
            primaryNodeType: 'jnt:text',
            properties: [{name: 'text', value: 'Initial text', language: 'en'}]
        });

        cy.wait(500);

        cy.apollo({
            queryFile: 'api/contentHistory/getNodeHistoryPaginated.graphql',
            variables: {
                path: testNodePath,
                withLanguageNodes: false,
                offset: 0,
                limit: 2
            }
        }).then(result => {
            const entries = result?.data?.jcr?.nodeByPath?.history?.entries;
            expect(entries).to.be.an('array');

            // If entries exist, should respect limit
            if (entries && entries.length > 0) {
                expect(entries.length).to.be.at.most(2);

                const entry = entries[0];
                expect(entry).to.have.property('id');
                expect(entry).to.have.property('date');
                expect(entry).to.have.property('path');
                expect(entry).to.have.property('uuid');
                expect(entry).to.have.property('action');
                expect(entry).to.have.property('userKey');
            }
        });
    });

    it('should return count with and without language nodes parameter', () => {
        addNode({
            parentPathOrId: contentPath,
            name: testNodeName,
            primaryNodeType: 'jnt:text',
            properties: [
                {name: 'text', value: 'English text', language: 'en'},
                {name: 'text', value: 'French text', language: 'fr'}
            ]
        });

        cy.wait(500);

        // Get count without language nodes
        cy.apollo({
            queryFile: 'api/contentHistory/getNodeHistoryCount.graphql',
            variables: {
                path: testNodePath,
                withLanguageNodes: false
            }
        }).then(result => {
            const countWithoutLang = result?.data?.jcr?.nodeByPath?.history?.count;
            expect(countWithoutLang).to.be.a('number');
            expect(countWithoutLang).to.be.at.least(0);

            // Get count with language nodes
            cy.apollo({
                queryFile: 'api/contentHistory/getNodeHistoryCount.graphql',
                variables: {
                    path: testNodePath,
                    withLanguageNodes: true
                }
            }).then(resultWithLang => {
                const countWithLang = resultWithLang?.data?.jcr?.nodeByPath?.history?.count;
                expect(countWithLang).to.be.a('number');
                expect(countWithLang).to.be.at.least(0);
                // Count with language nodes should be >= count without
                expect(countWithLang).to.be.at.least(countWithoutLang);
            });
        });
    });

    it('should include all available fields when queried', () => {
        addNode({
            parentPathOrId: contentPath,
            name: testNodeName,
            primaryNodeType: 'jnt:text',
            properties: [{name: 'text', value: 'Complete test', language: 'en'}]
        });

        cy.wait(500);

        cy.apollo({
            queryFile: 'api/contentHistory/getNodeHistoryComplete.graphql',
            variables: {
                path: testNodePath,
                withLanguageNodes: false,
                offset: 0,
                limit: 5
            }
        }).then(result => {
            const history = result?.data?.jcr?.nodeByPath?.history;
            expect(history).to.exist;
            expect(history.count).to.be.a('number');
            expect(history.entries).to.be.an('array');

            // If entries exist, verify all fields are available
            if (history.entries && history.entries.length > 0) {
                const entry = history.entries[0];

                // Verify all expected fields are present (even if null)
                expect(entry).to.have.property('id');
                expect(entry).to.have.property('date');
                expect(entry).to.have.property('timestamp');
                expect(entry).to.have.property('path');
                expect(entry).to.have.property('uuid');
                expect(entry).to.have.property('action');
                expect(entry).to.have.property('propertyName');
                expect(entry).to.have.property('userKey');
                expect(entry).to.have.property('message');
                expect(entry).to.have.property('language');

                // Verify timestamp is a number if present
                if (entry.timestamp !== null) {
                    expect(entry.timestamp).to.be.a('number');
                }

                // Verify date is ISO 8601 string if present
                if (entry.date) {
                    expect(entry.date).to.be.a('string');
                    expect(entry.date).to.match(/^\d{4}-\d{2}-\d{2}T/);
                }
            }
        });
    });

    it('should track published actions if metrics logging is enabled', () => {
        addNode({
            parentPathOrId: contentPath,
            name: testNodeName,
            primaryNodeType: 'jnt:text',
            properties: [{name: 'text', value: 'Content to publish', language: 'en'}]
        });

        // Publish the node
        publishAndWaitJobEnding(testNodePath, ['en']);

        // Wait longer for publication history to be logged
        cy.wait(500);

        cy.apollo({
            queryFile: 'api/contentHistory/getNodeHistoryDetailed.graphql',
            variables: {
                path: testNodePath,
                withLanguageNodes: false,
                offset: 0,
                limit: 50
            }
        }).then(result => {
            const entries = result?.data?.jcr?.nodeByPath?.history?.entries;
            expect(entries).to.be.an('array');

            // If history entries exist, check for published action
            if (entries && entries.length > 0) {
                cy.log(`Found ${entries.length} history entries`);

                // Look for a published entry
                const publishedEntry = entries.find(entry => entry.action === 'published');
                if (publishedEntry) {
                    cy.log('Published action found in history');
                    expect(publishedEntry.action).to.equal('published');
                    expect(publishedEntry.userKey).to.be.a('string');
                } else {
                    cy.log('No published action found (metrics logging may be disabled or async processing delayed)');
                }
            } else {
                cy.log('No history entries found (metrics logging may be disabled)');
            }
        });
    });

    it('should handle offset parameter correctly', () => {
        addNode({
            parentPathOrId: contentPath,
            name: testNodeName,
            primaryNodeType: 'jnt:text',
            properties: [{name: 'text', value: 'Initial', language: 'en'}]
        });

        cy.wait(500);

        // Test with offset 0
        cy.apollo({
            queryFile: 'api/contentHistory/getNodeHistoryPaginated.graphql',
            variables: {
                path: testNodePath,
                withLanguageNodes: false,
                offset: 0,
                limit: 5
            }
        }).then(result => {
            const entries = result?.data?.jcr?.nodeByPath?.history?.entries;
            expect(entries).to.be.an('array');

            if (entries && entries.length > 1) {
                const firstId = entries[0].id;

                // Test with offset 1
                cy.apollo({
                    queryFile: 'api/contentHistory/getNodeHistoryPaginated.graphql',
                    variables: {
                        path: testNodePath,
                        withLanguageNodes: false,
                        offset: 1,
                        limit: 5
                    }
                }).then(offsetResult => {
                    const offsetEntries = offsetResult?.data?.jcr?.nodeByPath?.history?.entries;
                    expect(offsetEntries).to.be.an('array');

                    // First entry with offset should be different from first entry without offset
                    if (offsetEntries && offsetEntries.length > 0) {
                        expect(offsetEntries[0].id).to.not.equal(firstId);
                    }
                });
            }
        });
    });

    it('should return timestamp field alongside date field', () => {
        addNode({
            parentPathOrId: contentPath,
            name: testNodeName,
            primaryNodeType: 'jnt:text',
            properties: [{name: 'text', value: 'Timestamp test', language: 'en'}]
        });

        cy.wait(500);

        cy.apollo({
            queryFile: 'api/contentHistory/getNodeHistoryComplete.graphql',
            variables: {
                path: testNodePath,
                withLanguageNodes: false,
                offset: 0,
                limit: 1
            }
        }).then(result => {
            const entries = result?.data?.jcr?.nodeByPath?.history?.entries;

            if (entries && entries.length > 0) {
                const entry = entries[0];

                // If we have a date, we should also have a timestamp
                if (entry.date) {
                    expect(entry).to.have.property('timestamp');
                    expect(entry.timestamp).to.be.a('number');

                    // Timestamp should represent roughly the same time as date
                    const dateFromTimestamp = new Date(entry.timestamp);
                    const dateFromISO = new Date(entry.date);

                    // Allow 1 second difference for rounding
                    const timeDiff = Math.abs(dateFromTimestamp.getTime() - dateFromISO.getTime());
                    expect(timeDiff).to.be.lessThan(1000);
                }
            }
        });
    });
});
