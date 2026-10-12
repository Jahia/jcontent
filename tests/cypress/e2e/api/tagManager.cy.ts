import {addNode, createSite, createUser, deleteNode, deleteSite, deleteUser, grantRoles, publishAndWaitJobEnding, revokeRoles} from '@jahia/cypress';

/**
 * End-to-end tests for the Tag Manager GraphQL API.
 *
 * Coverage:
 *  - Read side: getTags (with sorting), getTaggedContent
 *  - Mutation happy paths: renameTag, deleteTag, renameTagOnNode, deleteTagOnNode
 *  - Dual-workspace propagation (EDIT + LIVE)
 *  - Authorization failures (user without tagManager permission, wrong site key), refused by the
 *    Tag Manager's own site-level check
 *  - Site-level access: an editor holding tagManager on the site, with no server role
 *  - Per-node write rights: a caller holding tagManager still only writes the nodes it may write
 *  - Candidate selection: a tag carrying a quote is matched by the same rule as on the read side
 */
type WorkspaceResult = {workspace: string, processedCount: number, failedCount: number, failedPaths: string[]};

describe('Tag Manager GraphQL API', () => {
    const siteKey = 'tagManagerTestSite';
    const unauthorizedUser = 'tagManagerUnauthorized';
    const password = 'password';
    // An editor with only "Access to tag manager" added on the site: the setup of an editor role
    // extended with the Tag Manager permission, without touching Jahia's own roles
    const tagManagerRole = 'tagManagerTestEditor';

    // UUIDs captured during setup to reuse across tests
    let nodeAUuid: string;
    let nodeBUuid: string;

    before('Create site, tagged nodes, and test users', () => {
        createSite(siteKey);
        createUser(unauthorizedUser, password);
        // Grant editor (but NOT tagManager) on the site to the unauthorized user
        grantRoles(`/sites/${siteKey}`, ['editor'], unauthorizedUser, 'USER');

        // Create two content nodes tagged with 'alpha' and 'beta'
        addNode({
            parentPathOrId: `/sites/${siteKey}/contents`,
            name: 'taggedNodeA',
            primaryNodeType: 'jnt:contentList',
            mixins: ['jmix:tagged'],
            properties: [
                {name: 'j:tagList', values: ['alpha', 'beta'], type: 'STRING'}
            ]
        }).then(result => {
            nodeAUuid = result.data.jcr.addNode.uuid;
        });

        addNode({
            parentPathOrId: `/sites/${siteKey}/contents`,
            name: 'taggedNodeB',
            primaryNodeType: 'jnt:contentList',
            mixins: ['jmix:tagged'],
            properties: [
                {name: 'j:tagList', values: ['alpha'], type: 'STRING'}
            ]
        }).then(result => {
            nodeBUuid = result.data.jcr.addNode.uuid;
            // Publish both nodes so LIVE workspace is populated
            publishAndWaitJobEnding(`/sites/${siteKey}/contents/taggedNodeA`);
            publishAndWaitJobEnding(`/sites/${siteKey}/contents/taggedNodeB`);
        });
    });

    after('Remove test data', () => {
        deleteSite(siteKey);
        deleteUser(unauthorizedUser);
        // Only once the site is gone: the role cannot be deleted while ACEs on the site still grant it
        deleteNode(`/roles/editor/${tagManagerRole}`);
    });

    // ────────────────────────────────────────────────────────────────────────────
    // READ SIDE
    // ────────────────────────────────────────────────────────────────────────────

    describe('getTags', () => {
        it('returns all tags with occurrence counts as root (authorized)', () => {
            cy.apollo({
                queryFile: 'api/tagManager/getTags.graphql',
                variables: {siteKey}
            }).should(result => {
                const tags = result.data.jcontent.tagManager.tags.nodes;
                expect(tags).to.be.an('array').with.length.greaterThan(0);

                const alpha = tags.find(t => t.name === 'alpha');
                expect(alpha, 'alpha tag should exist').to.exist;
                expect(alpha.occurrences).to.equal(2);

                const beta = tags.find(t => t.name === 'beta');
                expect(beta, 'beta tag should exist').to.exist;
                expect(beta.occurrences).to.equal(1);
            });
        });

        it('returns tags sorted by occurrences descending', () => {
            cy.apollo({
                queryFile: 'api/tagManager/getTags.graphql',
                variables: {siteKey, fieldSorter: {fieldName: 'occurrences', sortType: 'DESC'}}
            }).should(result => {
                const tags = result.data.jcontent.tagManager.tags.nodes;
                for (let i = 1; i < tags.length; i++) {
                    expect(tags[i - 1].occurrences).to.be.greaterThan(tags[i].occurrences - 1);
                }
            });
        });

        it('denies access for a user without tagManager permission', () => {
            cy.apolloClient({username: unauthorizedUser, password})
                .apollo({
                    queryFile: 'api/tagManager/getTags.graphql',
                    variables: {siteKey},
                    errorPolicy: 'all'
                }).should(result => {
                    expect(result.errors, 'should contain a permission error').to.exist.and.not.be.empty;
                    expect(result.data?.jcontent?.tagManager).to.not.exist;
                    expect(result.errors[0].path, 'refused by the Tag Manager permission check').to.deep.equal(['jcontent', 'tagManager']);
                });
        });

        it('returns an error for an unknown site key', () => {
            cy.apollo({
                queryFile: 'api/tagManager/getTags.graphql',
                variables: {siteKey: 'nonExistentSite99'},
                errorPolicy: 'all'
            }).should(result => {
                expect(result.errors, 'should surface a repository or permission error').to.exist.and.not.be.empty;
            });
        });
    });

    describe('getTaggedContent', () => {
        it('returns all nodes carrying a given tag', () => {
            cy.apollo({
                queryFile: 'api/tagManager/getTaggedContent.graphql',
                variables: {siteKey, tag: 'alpha'}
            }).should(result => {
                const nodes = result.data.jcontent.tagManager.taggedContent.nodes;
                expect(nodes).to.have.length(2);

                const paths = nodes.map(n => n.path);
                expect(paths).to.include(`/sites/${siteKey}/contents/taggedNodeA`);
                expect(paths).to.include(`/sites/${siteKey}/contents/taggedNodeB`);
            });
        });

        it('returns only the matching node for an exclusive tag', () => {
            cy.apollo({
                queryFile: 'api/tagManager/getTaggedContent.graphql',
                variables: {siteKey, tag: 'beta'}
            }).should(result => {
                const nodes = result.data.jcontent.tagManager.taggedContent.nodes;
                expect(nodes).to.have.length(1);
                expect(nodes[0].path).to.equal(`/sites/${siteKey}/contents/taggedNodeA`);
            });
        });

        it('returns empty results for a tag that does not exist', () => {
            cy.apollo({
                queryFile: 'api/tagManager/getTaggedContent.graphql',
                variables: {siteKey, tag: 'nonExistentTag'}
            }).should(result => {
                const nodes = result.data.jcontent.tagManager.taggedContent.nodes;
                expect(nodes).to.have.length(0);
            });
        });

        it('denies access for a user without tagManager permission', () => {
            cy.apolloClient({username: unauthorizedUser, password})
                .apollo({
                    queryFile: 'api/tagManager/getTaggedContent.graphql',
                    variables: {siteKey, tag: 'alpha'},
                    errorPolicy: 'all'
                }).should(result => {
                    expect(result.errors).to.exist.and.not.be.empty;
                    expect(result.data?.jcontent?.tagManager).to.not.exist;
                    expect(result.errors[0].path, 'refused by the Tag Manager permission check').to.deep.equal(['jcontent', 'tagManager']);
                });
        });
    });

    // ────────────────────────────────────────────────────────────────────────────
    // MUTATIONS — BULK (site-wide)
    // ────────────────────────────────────────────────────────────────────────────

    describe('renameTag (bulk)', () => {
        it('renames the tag on all nodes in both workspaces', () => {
            cy.apollo({
                mutationFile: 'api/tagManager/renameTag.graphql',
                variables: {siteKey, tag: 'beta', newName: 'beta-renamed'}
            }).should(result => {
                const {tag, nodeId, workspaceResults} = result.data.jcontent.tagManager.renameTag;
                expect(tag).to.equal('beta');
                expect(nodeId).to.be.null;
                expect(workspaceResults).to.have.length(2);

                for (const wsResult of workspaceResults) {
                    expect(wsResult.processedCount).to.equal(1);
                    expect(wsResult.failedCount).to.equal(0);
                    expect(wsResult.failedPaths).to.be.empty;
                }
            });

            // Verify the old tag is gone and the new one appears
            cy.apollo({
                queryFile: 'api/tagManager/getTags.graphql',
                variables: {siteKey}
            }).should(result => {
                const names = result.data.jcontent.tagManager.tags.nodes.map(t => t.name);
                expect(names).to.not.include('beta');
                expect(names).to.include('beta-renamed');
            });
        });

        // The candidate nodes are selected by binding the tag as a query parameter, the same way the
        // read side does, so a tag carrying a quote is matched by one rule on both sides.
        it('renames a tag containing a quote on all nodes that carry it', () => {
            const quotedTag = 'o\'brien';

            addNode({
                parentPathOrId: `/sites/${siteKey}/contents`,
                name: 'quotedTagNode',
                primaryNodeType: 'jnt:contentList',
                mixins: ['jmix:tagged'],
                properties: [
                    {name: 'j:tagList', values: [quotedTag], type: 'STRING'}
                ]
            });

            cy.apollo({
                mutationFile: 'api/tagManager/renameTag.graphql',
                variables: {siteKey, tag: quotedTag, newName: 'obrien-renamed'}
            }).should(result => {
                const workspaceResults = result.data.jcontent.tagManager.renameTag.workspaceResults;

                const editResult = workspaceResults.find(wsResult => wsResult.workspace === 'default');
                expect(editResult.processedCount, 'the quoted tag selects its node').to.equal(1);
                expect(editResult.failedCount).to.equal(0);
            });

            cy.apollo({
                queryFile: 'api/tagManager/getTaggedContent.graphql',
                variables: {siteKey, tag: 'obrien-renamed'}
            }).should(result => {
                const paths = result.data.jcontent.tagManager.taggedContent.nodes.map(node => node.path);
                expect(paths).to.include(`/sites/${siteKey}/contents/quotedTagNode`);
            });
        });

        it('returns an error when newName is blank', () => {
            cy.apollo({
                mutationFile: 'api/tagManager/renameTag.graphql',
                variables: {siteKey, tag: 'alpha', newName: '   '},
                errorPolicy: 'all'
            }).should(result => {
                expect(result.errors).to.exist.and.not.be.empty;
            });
        });

        // The stored value is one tag per segment of the separator, each normalized on its own, so a name
        // that is non-blank as a whole can still store an empty tag — or no tag at all, which would drop
        // the renamed tag with nothing in its place.
        for (const newName of [' , ', ',']) {
            it(`returns an error when newName yields no usable tag (${JSON.stringify(newName)})`, () => {
                cy.apollo({
                    mutationFile: 'api/tagManager/renameTag.graphql',
                    variables: {siteKey, tag: 'alpha', newName},
                    errorPolicy: 'all'
                }).should(result => {
                    expect(result.errors, 'the mutation is refused').to.exist.and.not.be.empty;
                });

                // As root: 'alpha' is still there, so nothing was renamed away
                cy.apollo({
                    queryFile: 'api/tagManager/getTags.graphql',
                    variables: {siteKey}
                }).should(result => {
                    const names = result.data.jcontent.tagManager.tags.nodes.map(t => t.name);
                    expect(names).to.include('alpha');
                });
            });
        }

        it('denies bulk rename for a user without tagManager permission', () => {
            cy.apolloClient({username: unauthorizedUser, password})
                .apollo({
                    mutationFile: 'api/tagManager/renameTag.graphql',
                    variables: {siteKey, tag: 'alpha', newName: 'alpha-new'},
                    errorPolicy: 'all'
                }).should(result => {
                    expect(result.errors).to.exist.and.not.be.empty;
                    expect(result.data?.jcontent?.tagManager).to.not.exist;
                    expect(result.errors[0].path, 'refused by the Tag Manager permission check').to.deep.equal(['jcontent', 'tagManager']);
                });
        });
    });

    describe('deleteTag (bulk)', () => {
        // Use the 'beta-renamed' tag left by the preceding renameTag test
        it('removes the tag from all nodes in both workspaces', () => {
            cy.apollo({
                mutationFile: 'api/tagManager/deleteTag.graphql',
                variables: {siteKey, tag: 'beta-renamed'}
            }).should(result => {
                const {tag, nodeId, workspaceResults} = result.data.jcontent.tagManager.deleteTag;
                expect(tag).to.equal('beta-renamed');
                expect(nodeId).to.be.null;
                expect(workspaceResults).to.have.length(2);

                for (const wsResult of workspaceResults) {
                    expect(wsResult.processedCount).to.equal(1);
                    expect(wsResult.failedCount).to.equal(0);
                    expect(wsResult.failedPaths).to.be.empty;
                }
            });

            // Verify the tag is gone from the read side
            cy.apollo({
                queryFile: 'api/tagManager/getTags.graphql',
                variables: {siteKey}
            }).should(result => {
                const names = result.data.jcontent.tagManager.tags.nodes.map(t => t.name);
                expect(names).to.not.include('beta-renamed');
            });
        });

        it('denies bulk delete for a user without tagManager permission', () => {
            cy.apolloClient({username: unauthorizedUser, password})
                .apollo({
                    mutationFile: 'api/tagManager/deleteTag.graphql',
                    variables: {siteKey, tag: 'alpha'},
                    errorPolicy: 'all'
                }).should(result => {
                    expect(result.errors).to.exist.and.not.be.empty;
                    expect(result.data?.jcontent?.tagManager).to.not.exist;
                    expect(result.errors[0].path, 'refused by the Tag Manager permission check').to.deep.equal(['jcontent', 'tagManager']);
                });
        });
    });

    // ────────────────────────────────────────────────────────────────────────────
    // MUTATIONS — SINGLE NODE
    // ────────────────────────────────────────────────────────────────────────────

    describe('renameTagOnNode', () => {
        it('renames the tag on a single node in both workspaces', () => {
            cy.apollo({
                mutationFile: 'api/tagManager/renameTagOnNode.graphql',
                variables: {siteKey, tag: 'alpha', newName: 'alpha-node-renamed', nodeId: nodeAUuid}
            }).should(result => {
                const {tag, nodeId, workspaceResults} = result.data.jcontent.tagManager.renameTagOnNode;
                expect(tag).to.equal('alpha');
                expect(nodeId).to.equal(nodeAUuid);
                expect(workspaceResults).to.have.length(2);

                for (const wsResult of workspaceResults) {
                    expect(wsResult.processedCount).to.equal(1);
                    expect(wsResult.failedCount).to.equal(0);
                    expect(wsResult.failedPaths).to.be.empty;
                }
            });

            // NodeB still has 'alpha'; nodeA should now have 'alpha-node-renamed'
            cy.apollo({
                queryFile: 'api/tagManager/getTaggedContent.graphql',
                variables: {siteKey, tag: 'alpha-node-renamed'}
            }).should(result => {
                const nodes = result.data.jcontent.tagManager.taggedContent.nodes;
                expect(nodes).to.have.length(1);
                expect(nodes[0].path).to.equal(`/sites/${siteKey}/contents/taggedNodeA`);
            });
        });

        it('completes without error when the tag is absent on the node', () => {
            // NodeA no longer has 'alpha' after the rename above
            cy.apollo({
                mutationFile: 'api/tagManager/renameTagOnNode.graphql',
                variables: {siteKey, tag: 'alpha', newName: 'alpha-again', nodeId: nodeAUuid}
            }).should(result => {
                const workspaceResults = result.data.jcontent.tagManager.renameTagOnNode.workspaceResults;
                for (const wsResult of workspaceResults) {
                    expect(wsResult.failedCount).to.equal(0);
                }
            });
        });

        it('rejects renameTagOnNode when node belongs to a different site', () => {
            // Use the UUID of nodeA against a fabricated different siteKey
            cy.apollo({
                mutationFile: 'api/tagManager/renameTagOnNode.graphql',
                variables: {siteKey: 'systemsite', tag: 'alpha', newName: 'alpha-x', nodeId: nodeAUuid},
                errorPolicy: 'all'
            }).should(result => {
                expect(result.errors).to.exist.and.not.be.empty;
            });
        });

        it('denies renameTagOnNode for a user without tagManager permission', () => {
            cy.apolloClient({username: unauthorizedUser, password})
                .apollo({
                    mutationFile: 'api/tagManager/renameTagOnNode.graphql',
                    variables: {siteKey, tag: 'alpha', newName: 'alpha-x', nodeId: nodeAUuid},
                    errorPolicy: 'all'
                }).should(result => {
                    expect(result.errors).to.exist.and.not.be.empty;
                    expect(result.data?.jcontent?.tagManager).to.not.exist;
                    expect(result.errors[0].path, 'refused by the Tag Manager permission check').to.deep.equal(['jcontent', 'tagManager']);
                });
        });
    });

    describe('deleteTagOnNode', () => {
        it('removes a tag from a single node in both workspaces', () => {
            // NodeBUuid has 'alpha'; remove it
            cy.apollo({
                mutationFile: 'api/tagManager/deleteTagOnNode.graphql',
                variables: {siteKey, tag: 'alpha', nodeId: nodeBUuid}
            }).should(result => {
                const {tag, nodeId, workspaceResults} = result.data.jcontent.tagManager.deleteTagOnNode;
                expect(tag).to.equal('alpha');
                expect(nodeId).to.equal(nodeBUuid);
                expect(workspaceResults).to.have.length(2);

                for (const wsResult of workspaceResults) {
                    expect(wsResult.processedCount).to.equal(1);
                    expect(wsResult.failedCount).to.equal(0);
                    expect(wsResult.failedPaths).to.be.empty;
                }
            });

            // Verify nodeB no longer appears in tagged content for 'alpha'
            cy.apollo({
                queryFile: 'api/tagManager/getTaggedContent.graphql',
                variables: {siteKey, tag: 'alpha'}
            }).should(result => {
                const uuids = result.data.jcontent.tagManager.taggedContent.nodes.map(n => n.uuid);
                expect(uuids).to.not.include(nodeBUuid);
            });
        });

        it('rejects deleteTagOnNode when node belongs to a different site', () => {
            cy.apollo({
                mutationFile: 'api/tagManager/deleteTagOnNode.graphql',
                variables: {siteKey: 'systemsite', tag: 'alpha', nodeId: nodeBUuid},
                errorPolicy: 'all'
            }).should(result => {
                expect(result.errors).to.exist.and.not.be.empty;
            });
        });

        it('denies deleteTagOnNode for a user without tagManager permission', () => {
            cy.apolloClient({username: unauthorizedUser, password})
                .apollo({
                    mutationFile: 'api/tagManager/deleteTagOnNode.graphql',
                    variables: {siteKey, tag: 'alpha', nodeId: nodeBUuid},
                    errorPolicy: 'all'
                }).should(result => {
                    expect(result.errors).to.exist.and.not.be.empty;
                    expect(result.data?.jcontent?.tagManager).to.not.exist;
                    expect(result.errors[0].path, 'refused by the Tag Manager permission check').to.deep.equal(['jcontent', 'tagManager']);
                });
        });
    });

    // ────────────────────────────────────────────────────────────────────────────
    // PER-NODE WRITE RIGHTS
    //
    // Holding tagManager on the site opens the Tag Manager; it does not make every node
    // under the site writable. A node the caller's roles are denied on is out of reach and
    // must keep its tags, in BOTH workspaces — the live copy is updated by the same
    // operation, so the edit workspace decides for both.
    // ────────────────────────────────────────────────────────────────────────────

    describe('per-node write rights', () => {
        const tagManagerUser = 'tagManagerScoped';
        const restrictedNodePath = `/sites/${siteKey}/contents/restrictedNode`;
        let restrictedNodeUuid: string;

        before('Create a tag-manager user, a reachable node and an out-of-reach node', () => {
            // Nested under editor, so it inherits the editor's rights on the site content; its own
            // current-site permissions add tagManager and nothing else
            addNode({
                parentPathOrId: '/roles/editor',
                name: tagManagerRole,
                primaryNodeType: 'jnt:role',
                properties: [
                    {name: 'j:roleGroup', value: 'edit-role'},
                    {name: 'j:privilegedAccess', value: 'true', type: 'BOOLEAN'}
                ],
                children: [{
                    name: 'currentSite-access',
                    primaryNodeType: 'jnt:externalPermissions',
                    properties: [
                        {name: 'j:path', value: 'currentSite'},
                        {name: 'j:permissionNames', values: ['tagManager']}
                    ]
                }]
            });
            createUser(tagManagerUser, password);
            grantRoles(`/sites/${siteKey}`, [tagManagerRole], tagManagerUser, 'USER');

            addNode({
                parentPathOrId: `/sites/${siteKey}/contents`,
                name: 'reachableNode',
                primaryNodeType: 'jnt:contentList',
                mixins: ['jmix:tagged'],
                properties: [
                    {name: 'j:tagList', values: ['scoped'], type: 'STRING'}
                ]
            });

            addNode({
                parentPathOrId: `/sites/${siteKey}/contents`,
                name: 'restrictedNode',
                primaryNodeType: 'jnt:contentList',
                mixins: ['jmix:tagged'],
                properties: [
                    {name: 'j:tagList', values: ['restricted'], type: 'STRING'}
                ]
            }).then(result => {
                restrictedNodeUuid = result.data.jcr.addNode.uuid;
                // Publish first, so the tag exists in both workspaces...
                publishAndWaitJobEnding(restrictedNodePath);
                // ...then DENY the role on this node only, putting it out of the user's reach
                // while tagManager on the site itself is untouched
                revokeRoles(restrictedNodePath, [tagManagerRole], tagManagerUser, 'USER');
            });
        });

        after('Remove the test user', () => {
            deleteUser(tagManagerUser);
        });

        it('lets an editor holding tagManager on the site, with no server role, read the tags', () => {
            cy.apolloClient({username: tagManagerUser, password})
                .apollo({
                    queryFile: 'api/tagManager/getTags.graphql',
                    variables: {siteKey},
                    errorPolicy: 'all'
                }).should(result => {
                    expect(result.errors, 'no server-level permission should be required').to.not.exist;

                    const names = result.data.jcontent.tagManager.tags.nodes.map(tag => tag.name);
                    expect(names).to.include('scoped');
                });
        });

        it('renames a tag the caller may write (site-wide)', () => {
            cy.apolloClient({username: tagManagerUser, password})
                .apollo({
                    mutationFile: 'api/tagManager/renameTag.graphql',
                    variables: {siteKey, tag: 'scoped', newName: 'scoped-renamed'}
                }).should(result => {
                    const workspaceResults = result.data.jcontent.tagManager.renameTag.workspaceResults;

                    const editResult = workspaceResults.find(wsResult => wsResult.workspace === 'default');
                    expect(editResult.processedCount).to.equal(1);
                    expect(editResult.failedCount).to.equal(0);
                });

            cy.apollo({
                queryFile: 'api/tagManager/getTaggedContent.graphql',
                variables: {siteKey, tag: 'scoped-renamed'}
            }).should(result => {
                const nodes = result.data.jcontent.tagManager.taggedContent.nodes;
                expect(nodes).to.have.length(1);
                expect(nodes[0].path).to.equal(`/sites/${siteKey}/contents/reachableNode`);
            });
        });

        it('leaves a node the caller may not write untouched on a site-wide rename', () => {
            cy.apolloClient({username: tagManagerUser, password})
                .apollo({
                    mutationFile: 'api/tagManager/renameTag.graphql',
                    variables: {siteKey, tag: 'restricted', newName: 'restricted-renamed'}
                }).should(result => {
                    const workspaceResults = result.data.jcontent.tagManager.renameTag.workspaceResults;

                    const processed = workspaceResults.reduce((total: number, wsResult: WorkspaceResult) => total + wsResult.processedCount, 0);

                    const failed = workspaceResults.reduce((total: number, wsResult: WorkspaceResult) => total + wsResult.failedCount, 0);
                    expect(processed, 'no node is written').to.equal(0);
                    expect(failed, 'the out-of-reach node is reported as a failure').to.be.greaterThan(0);
                });

            // As root: the tag is still on the node, under its original name
            cy.apollo({
                queryFile: 'api/tagManager/getTaggedContent.graphql',
                variables: {siteKey, tag: 'restricted'}
            }).should(result => {
                const paths = result.data.jcontent.tagManager.taggedContent.nodes.map(node => node.path);
                expect(paths).to.include(restrictedNodePath);
            });
        });

        it('leaves a node the caller may not write untouched on a site-wide delete', () => {
            cy.apolloClient({username: tagManagerUser, password})
                .apollo({
                    mutationFile: 'api/tagManager/deleteTag.graphql',
                    variables: {siteKey, tag: 'restricted'}
                }).should(result => {
                    const workspaceResults = result.data.jcontent.tagManager.deleteTag.workspaceResults;

                    const processed = workspaceResults.reduce((total: number, wsResult: WorkspaceResult) => total + wsResult.processedCount, 0);
                    expect(processed, 'no node is written').to.equal(0);
                });

            cy.apollo({
                queryFile: 'api/tagManager/getTaggedContent.graphql',
                variables: {siteKey, tag: 'restricted'}
            }).should(result => {
                const paths = result.data.jcontent.tagManager.taggedContent.nodes.map(node => node.path);
                expect(paths).to.include(restrictedNodePath);
            });
        });

        it('rejects renameTagOnNode on a node the caller may not write', () => {
            cy.apolloClient({username: tagManagerUser, password})
                .apollo({
                    mutationFile: 'api/tagManager/renameTagOnNode.graphql',
                    variables: {siteKey, tag: 'restricted', newName: 'restricted-renamed', nodeId: restrictedNodeUuid},
                    errorPolicy: 'all'
                }).should(result => {
                    expect(result.errors).to.exist.and.not.be.empty;
                });

            cy.apollo({
                queryFile: 'api/tagManager/getTaggedContent.graphql',
                variables: {siteKey, tag: 'restricted'}
            }).should(result => {
                const paths = result.data.jcontent.tagManager.taggedContent.nodes.map(node => node.path);
                expect(paths).to.include(restrictedNodePath);
            });
        });

        it('rejects deleteTagOnNode on a node the caller may not write', () => {
            cy.apolloClient({username: tagManagerUser, password})
                .apollo({
                    mutationFile: 'api/tagManager/deleteTagOnNode.graphql',
                    variables: {siteKey, tag: 'restricted', nodeId: restrictedNodeUuid},
                    errorPolicy: 'all'
                }).should(result => {
                    expect(result.errors).to.exist.and.not.be.empty;
                });

            cy.apollo({
                queryFile: 'api/tagManager/getTaggedContent.graphql',
                variables: {siteKey, tag: 'restricted'}
            }).should(result => {
                const paths = result.data.jcontent.tagManager.taggedContent.nodes.map(node => node.path);
                expect(paths).to.include(restrictedNodePath);
            });
        });
    });
});
