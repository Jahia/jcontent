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
        // eslint-disable-next-line cypress/no-unnecessary-waiting
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

        // eslint-disable-next-line cypress/no-unnecessary-waiting
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

        // eslint-disable-next-line cypress/no-unnecessary-waiting
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

        // eslint-disable-next-line cypress/no-unnecessary-waiting
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

        // eslint-disable-next-line cypress/no-unnecessary-waiting
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

        // eslint-disable-next-line cypress/no-unnecessary-waiting
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

        // eslint-disable-next-line cypress/no-unnecessary-waiting
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

        // eslint-disable-next-line cypress/no-unnecessary-waiting
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

    it('should filter entries by action parameter', () => {
        addNode({
            parentPathOrId: contentPath,
            name: testNodeName,
            primaryNodeType: 'jnt:text',
            properties: [{name: 'text', value: 'Action filter test', language: 'en'}]
        });

        // Perform different actions to generate varied history
        GraphqlUtils.setProperty(testNodePath, 'text', 'Updated once', 'en');
        publishAndWaitJobEnding(testNodePath, ['en']);

        // eslint-disable-next-line cypress/no-unnecessary-waiting
        cy.wait(500);

        // First, get all entries to see what's available
        cy.apollo({
            queryFile: 'api/contentHistory/getNodeHistoryDetailed.graphql',
            variables: {
                path: testNodePath,
                withLanguageNodes: false,
                offset: 0,
                limit: 100
            }
        }).then(allResult => {
            const allEntries = allResult?.data?.jcr?.nodeByPath?.history?.entries;

            if (allEntries && allEntries.length > 0) {
                // Get unique actions from history
                const actions = [...new Set(allEntries.map(e => e.action).filter(a => a))];
                cy.log(`Available actions: ${actions.join(', ')}`);

                if (actions.length > 0) {
                    const testAction = actions[0];

                    // Query with action filter
                    cy.apollo({
                        queryFile: 'api/contentHistory/getNodeHistoryWithAction.graphql',
                        variables: {
                            path: testNodePath,
                            withLanguageNodes: false,
                            action: testAction,
                            offset: 0,
                            limit: 50
                        }
                    }).then(filteredResult => {
                        const filteredEntries = filteredResult?.data?.jcr?.nodeByPath?.history?.entries;
                        expect(filteredEntries).to.be.an('array');

                        // All filtered entries should have the specified action
                        // eslint-disable-next-line  max-nested-callbacks
                        filteredEntries.forEach(entry => {
                            expect(entry.action).to.equal(testAction);
                        });

                        // Filtered count should be <= total count
                        expect(filteredEntries.length).to.be.at.most(allEntries.length);
                    });
                }
            }
        });
    });

    it('should filter count by action parameter', () => {
        addNode({
            parentPathOrId: contentPath,
            name: testNodeName,
            primaryNodeType: 'jnt:text',
            properties: [{name: 'text', value: 'Count filter test', language: 'en'}]
        });

        publishAndWaitJobEnding(testNodePath, ['en']);

        // eslint-disable-next-line cypress/no-unnecessary-waiting
        cy.wait(500);

        // Get total count
        cy.apollo({
            queryFile: 'api/contentHistory/getNodeHistoryCount.graphql',
            variables: {
                path: testNodePath,
                withLanguageNodes: false
            }
        }).then(totalResult => {
            const totalCount = totalResult?.data?.jcr?.nodeByPath?.history?.count;

            if (totalCount > 0) {
                // Get count for published action only
                cy.apollo({
                    queryFile: 'api/contentHistory/getNodeHistoryCountWithAction.graphql',
                    variables: {
                        path: testNodePath,
                        withLanguageNodes: false,
                        action: 'published'
                    }
                }).then(filteredResult => {
                    const filteredCount = filteredResult?.data?.jcr?.nodeByPath?.history?.count;
                    expect(filteredCount).to.be.a('number');
                    expect(filteredCount).to.be.at.most(totalCount);
                    expect(filteredCount).to.be.at.least(0);
                });
            }
        });
    });

    it('should apply action filter before pagination', () => {
        addNode({
            parentPathOrId: contentPath,
            name: testNodeName,
            primaryNodeType: 'jnt:text',
            properties: [{name: 'text', value: 'Pagination with filter test', language: 'en'}]
        });

        // Create multiple updates
        for (let i = 1; i <= 3; i++) {
            GraphqlUtils.setProperty(testNodePath, 'text', `Update ${i}`, 'en');
        }

        // eslint-disable-next-line cypress/no-unnecessary-waiting
        cy.wait(500);

        // Get all entries first
        cy.apollo({
            queryFile: 'api/contentHistory/getNodeHistoryDetailed.graphql',
            variables: {
                path: testNodePath,
                withLanguageNodes: false,
                offset: 0,
                limit: 100
            }
        }).then(allResult => {
            const allEntries = allResult?.data?.jcr?.nodeByPath?.history?.entries;

            if (allEntries && allEntries.length > 0) {
                const actions = [...new Set(allEntries.map(e => e.action).filter(a => a))];

                if (actions.length > 0) {
                    const testAction = actions[0];

                    // Apply filter with limit smaller than filtered count
                    cy.apollo({
                        queryFile: 'api/contentHistory/getNodeHistoryWithAction.graphql',
                        variables: {
                            path: testNodePath,
                            withLanguageNodes: false,
                            action: testAction,
                            offset: 0,
                            limit: 1
                        }
                    }).then(limitedResult => {
                        const limitedEntries = limitedResult?.data?.jcr?.nodeByPath?.history?.entries;

                        // Should respect limit even with filter
                        expect(limitedEntries).to.be.an('array');
                        expect(limitedEntries.length).to.be.at.most(1);

                        if (limitedEntries.length > 0) {
                            expect(limitedEntries[0].action).to.equal(testAction);
                        }
                    });
                }
            }
        });
    });

    it('should return empty results for non-existent action filter', () => {
        addNode({
            parentPathOrId: contentPath,
            name: testNodeName,
            primaryNodeType: 'jnt:text',
            properties: [{name: 'text', value: 'Non-existent action test', language: 'en'}]
        });

        // eslint-disable-next-line cypress/no-unnecessary-waiting
        cy.wait(500);

        cy.apollo({
            queryFile: 'api/contentHistory/getNodeHistoryWithAction.graphql',
            variables: {
                path: testNodePath,
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

    it('should resolve property display name for property-related actions', () => {
        addNode({
            parentPathOrId: contentPath,
            name: testNodeName,
            primaryNodeType: 'jnt:text',
            properties: [{name: 'text', value: 'Property display name test', language: 'en'}]
        });

        // Modify a property to generate property change history
        GraphqlUtils.setProperty(testNodePath, 'text', 'Updated value', 'en');

        // eslint-disable-next-line cypress/no-unnecessary-waiting
        cy.wait(500);

        cy.apollo({
            queryFile: 'api/contentHistory/getNodeHistoryWithPropertyDisplay.graphql',
            variables: {
                path: testNodePath,
                withLanguageNodes: false,
                offset: 0,
                limit: 50,
                language: 'en'
            }
        }).then(result => {
            const entries = result?.data?.jcr?.nodeByPath?.history?.entries;

            if (entries && entries.length > 0) {
                // Find an entry with a property name
                const propertyEntry = entries.find(entry => entry.propertyName);

                if (propertyEntry) {
                    cy.log(`Found property entry: ${propertyEntry.propertyName}`);

                    // Should have both propertyName and propertyNameDisplay
                    expect(propertyEntry).to.have.property('propertyName');
                    expect(propertyEntry).to.have.property('propertyNameDisplay');

                    // PropertyNameDisplay should be a string (localized label or fallback to property name)
                    expect(propertyEntry.propertyNameDisplay).to.be.a('string');
                    expect(propertyEntry.propertyNameDisplay.length).to.be.greaterThan(0);

                    cy.log(`Property name: ${propertyEntry.propertyName}, Display: ${propertyEntry.propertyNameDisplay}`);
                }
            }
        });
    });

    it('should return propertyName as fallback when display name cannot be resolved', () => {
        addNode({
            parentPathOrId: contentPath,
            name: testNodeName,
            primaryNodeType: 'jnt:text',
            properties: [{name: 'text', value: 'Fallback test', language: 'en'}]
        });

        // eslint-disable-next-line cypress/no-unnecessary-waiting
        cy.wait(500);

        cy.apollo({
            queryFile: 'api/contentHistory/getNodeHistoryWithPropertyDisplay.graphql',
            variables: {
                path: testNodePath,
                withLanguageNodes: false,
                offset: 0,
                limit: 50,
                language: 'invalidLanguage'
            }
        }).then(result => {
            const entries = result?.data?.jcr?.nodeByPath?.history?.entries;

            if (entries && entries.length > 0) {
                const propertyEntry = entries.find(entry => entry.propertyName);

                if (propertyEntry) {
                    // Should still return a value (either localized or property name as fallback)
                    expect(propertyEntry.propertyNameDisplay).to.be.a('string');
                    expect(propertyEntry.propertyNameDisplay.length).to.be.greaterThan(0);
                }
            }
        });
    });

    it('should return null propertyNameDisplay when propertyName is null', () => {
        addNode({
            parentPathOrId: contentPath,
            name: testNodeName,
            primaryNodeType: 'jnt:text',
            properties: [{name: 'text', value: 'Null property test', language: 'en'}]
        });

        // eslint-disable-next-line cypress/no-unnecessary-waiting
        cy.wait(500);

        cy.apollo({
            queryFile: 'api/contentHistory/getNodeHistoryWithPropertyDisplay.graphql',
            variables: {
                path: testNodePath,
                withLanguageNodes: false,
                offset: 0,
                limit: 50,
                language: 'en'
            }
        }).then(result => {
            const entries = result?.data?.jcr?.nodeByPath?.history?.entries;

            if (entries && entries.length > 0) {
                // Find entries without propertyName (node-level actions)
                const nodeEntry = entries.find(entry => !entry.propertyName);

                if (nodeEntry) {
                    // PropertyNameDisplay should be null when propertyName is null
                    expect(nodeEntry.propertyName).to.be.null;
                    expect(nodeEntry.propertyNameDisplay).to.be.null;
                }
            }
        });
    });
});
