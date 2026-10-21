import {addNode, createSite, createUser, deleteSite, deleteUser, enableModule, grantRoles, publishAndWaitJobEnding} from '@jahia/cypress';
import gql from 'graphql-tag';
import {JContent, SidePanel} from '../../../page-object';

/**
 * Content samples: real, filled site content kept per site as previewable examples of a content
 * type, so an author choosing a type can see what it looks like and start from it.
 *
 * Node inventory, all created once in `before`:
 *  - contents/sample-source      : jnt:text, the content saved as a sample by the save tests
 *  - contents/sample-source-two  : jnt:text, a second one, so the picker has more than one sample
 *  - contents/not-a-sample       : jnt:text, never saved - used for the negative preview assertions
 *  - contents/cache-source       : jnt:bigText, saved mid-test by the picker-refresh assertion
 *
 * Epic #2815.
 */
describe('Content samples', () => {
    const siteKey = 'contentSamplesSite';
    const sitePath = `/sites/${siteKey}`;
    const samplesPath = `${sitePath}/samples`;
    const editor = {username: 'contentSamplesEditor', password: 'Samples_Test_1!'};

    const sidePanel = new SidePanel();

    const childNamesOf = (path: string) => cy.apollo({
        query: gql`query childrenOf($path: String!) {
            jcr { node: nodeByPath(path: $path) { children { nodes { name } } } }
        }`,
        variables: {path}
    });

    before(() => {
        cy.loginAndStoreSession();
        createSite(siteKey, {
            serverName: 'localhost',
            locale: 'en',
            templateSet: 'jcontent-test-template'
        });
        enableModule('jcontent-test-module', siteKey);

        createUser(editor.username, editor.password);
        grantRoles(sitePath, ['editor'], editor.username, 'USER');

        addNode({
            parentPathOrId: `${sitePath}/contents`,
            name: 'sample-source',
            primaryNodeType: 'jnt:text',
            properties: [{name: 'text', value: 'a filled example', language: 'en'}]
        });
        addNode({
            parentPathOrId: `${sitePath}/contents`,
            name: 'sample-source-two',
            primaryNodeType: 'jnt:text',
            properties: [{name: 'text', value: 'a second filled example', language: 'en'}]
        });
        addNode({
            parentPathOrId: `${sitePath}/contents`,
            name: 'not-a-sample',
            primaryNodeType: 'jnt:text',
            properties: [{name: 'text', value: 'ordinary content', language: 'en'}]
        });
        // A type no other test saves a sample for, so the picker genuinely has none when the
        // refresh assertion primes the query.
        addNode({
            parentPathOrId: `${sitePath}/contents`,
            name: 'cache-source',
            primaryNodeType: 'jnt:bigText',
            properties: [{name: 'text', value: '<p>a rich example</p>', language: 'en'}]
        });
    });

    after(() => {
        cy.logout();
        deleteSite(siteKey);
        deleteUser(editor.username);
    });

    beforeEach(() => {
        cy.loginAndStoreSession();
    });

    describe('Structure and browsing', () => {
        it('should provision a samples branch holding both categories', () => {
            cy.apollo({
                query: gql`query samplesBranch($path: String!) {
                    jcr {
                        node: nodeByPath(path: $path) {
                            primaryNodeType { name }
                            nolive: isNodeType(type: {types: ["jmix:nolive"]})
                            children { nodes { name primaryNodeType { name } } }
                        }
                    }
                }`,
                variables: {path: samplesPath}
            }).should(result => {
                // Optional chaining throughout: should() retries, and the result is undefined on
                // the first pass - destructuring it throws instead of letting the retry happen.
                const node = result?.data?.jcr?.node;
                expect(node?.primaryNodeType?.name).to.equal('jnt:samplesFolder');
                // The root carries it through its supertype list, and each sample carries it too,
                // added on save. The root alone never stopped a publish aimed straight at a sample:
                // JCRPublicationService tests the mixin on the node it is handed, not its ancestors.
                expect(node?.nolive, 'samples root should be nolive').to.equal(true);

                const categories = node?.children?.nodes ?? [];
                expect(categories.map(n => n.name)).to.include.members(['pages', 'components']);
                categories
                    .filter(n => ['pages', 'components'].includes(n.name))
                    .forEach(n => expect(n.primaryNodeType.name).to.equal('jnt:samplesCategory'));
            });
        });

        it('should offer the Samples accordion to an administrator', () => {
            const jcontent = JContent.visit(siteKey, 'en', 'pages/home');
            jcontent.getAccordionItem('samples').getHeader().should('be.visible');
        });

        it('should not offer the Samples accordion to an editor', () => {
            // The samplesAccordionAccess permission sits outside the jContentAccordions aggregate on
            // purpose: granting a parent permission grants every child through privilege
            // aggregation, and an editor already holds jContentAccordions.
            cy.logout();
            cy.login(editor.username, editor.password);

            const jcontent = JContent.visit(siteKey, 'en', 'pages/home');
            jcontent.getAccordionItem('pages').getHeader().should('be.visible');
            jcontent.getAccordionItem('samples').shouldNotExist();

            cy.logout();
        });
    });

    describe('Saving content as a sample', () => {
        it('should save a component into the components category', () => {
            const jcontent = JContent.visit(siteKey, 'en', 'content-folders/contents');
            jcontent.selectContextMenuByRowName('sample-source', 'copyToSamples');

            childNamesOf(`${samplesPath}/components`).should(result => {
                const names = (result?.data?.jcr?.node?.children?.nodes ?? []).map(n => n.name);
                expect(names).to.include('sample-source');
            });
        });

        it('should leave the original where it was', () => {
            cy.apollo({
                query: gql`query stillThere($path: String!) {
                    jcr { node: nodeByPath(path: $path) { path } }
                }`,
                variables: {path: `${sitePath}/contents/sample-source`}
            }).should(result => {
                expect(result?.data?.jcr?.node?.path).to.equal(`${sitePath}/contents/sample-source`);
            });
        });

        it('should not offer the action on a node already inside the samples branch', () => {
            const jcontent = JContent.visit(siteKey, 'en', 'samples/components');
            jcontent.getTable().getRowByName('sample-source').contextMenu()
                .shouldNotHaveItem('Save as sample');
        });
    });

    describe('Previewing a sample in the content type picker', () => {
        it('should render a sample of the selected type', () => {
            const jcontent = JContent.visit(siteKey, 'en', 'content-folders/contents');
            const selector = jcontent.getCreateContent().open().getContentTypeSelector();

            selector.searchForContentType('Text').selectContentType('jnt:text');
            selector.getSamplePreview().shouldRenderContaining('a filled example');
            selector.cancel();
        });

        it('should say so when the selected type has no sample', () => {
            const jcontent = JContent.visit(siteKey, 'en', 'content-folders/contents');
            const selector = jcontent.getCreateContent().open().getContentTypeSelector();

            // Most types have no sample - an empty result is the ordinary case, not an error.
            selector.searchForContentType('Bound').selectContentType('cent:boundComponent');
            cy.get('[data-sel-role="sample-preview-empty"]').should('be.visible');
            selector.cancel();
        });

        it('should invite the author to pick a type before anything is selected', () => {
            const jcontent = JContent.visit(siteKey, 'en', 'content-folders/contents');
            jcontent.getCreateContent().open().getContentTypeSelector();

            cy.get('[data-sel-role="sample-preview-placeholder"]').should('be.visible');
        });
    });

    describe('Creating content from a sample', () => {
        it('should create a filled copy rather than an empty node', () => {
            const jcontent = JContent.visit(siteKey, 'en', 'content-folders/contents');
            const selector = jcontent.getCreateContent().open().getContentTypeSelector();

            selector.searchForContentType('Text').selectContentType('jnt:text');
            selector.getSamplePreview().shouldRenderContaining('a filled example');
            selector.useSample();

            // The copy is pasted with namingConflictResolution RENAME, so it lands beside the
            // original name rather than overwriting anything.
            childNamesOf(`${sitePath}/contents`).should(result => {
                const names = (result?.data?.jcr?.node?.children?.nodes ?? []).map(n => n.name);
                expect(names.some(name => name.startsWith('sample-source-') && name !== 'sample-source-two'))
                    .to.equal(true);
            });
        });

        it('should produce content that can still be published', () => {
            // This is the release-order guard between repositories, and it fails loudly if jcontent
            // ships ahead of core: it passes only where forbiddenMixinToCopy excludes jmix:nolive.
            // Without that exclusion the mixin now carried by every sample travels with the copy, and
            // content inserted from a sample is silently unpublishable forever.
            childNamesOf(`${sitePath}/contents`).then(result => {
                const inserted = (result?.data?.jcr?.node?.children?.nodes ?? [])
                    .map(n => n.name)
                    .find(name => name.startsWith('sample-source-') && name !== 'sample-source-two');

                cy.apollo({
                    query: gql`query canPublish($path: String!) {
                        jcr { node: nodeByPath(path: $path) {
                            nolive: isNodeType(type: {types: ["jmix:nolive"]})
                            operationsSupport { publication }
                        } }
                    }`,
                    variables: {path: `${sitePath}/contents/${inserted}`}
                }).should(check => {
                    const node = check?.data?.jcr?.node;
                    expect(node?.nolive, 'content made from a sample must not be nolive').to.equal(false);
                    expect(node?.operationsSupport?.publication).to.equal(true);
                });
            });
        });
    });

    describe('Previewing a sample in the Samples accordion', () => {
        it('should render the sample, not an empty pane', () => {
            const jcontent = JContent.visit(siteKey, 'en', 'samples/components');
            jcontent.getTable().getRowByName('sample-source').click();
            sidePanel.switchToTab('tab-preview');

            cy.get('iframe[data-sel-role="edit-preview-frame"]')
                .its('0.contentDocument.body')
                .should('be.visible')
                .and('contain.text', 'a filled example');
        });

        it('should offer the viewport widths for a sample', () => {
            const jcontent = JContent.visit(siteKey, 'en', 'samples/components');
            jcontent.getTable().getRowByName('sample-source').click();
            sidePanel.switchToTab('tab-preview');

            cy.get('[data-sel-role="preview-viewport"]').should('be.visible');
            cy.get('[data-sel-role="preview-viewport-frame"]').should('exist');
        });

        it('should leave ordinary content on the plain full-width preview', () => {
            // Scoped to samples deliberately: rendering non-displayable nodes at a default view
            // elsewhere drops whole folder listings into the pane.
            const jcontent = JContent.visit(siteKey, 'en', 'content-folders/contents');
            jcontent.getTable().getRowByName('not-a-sample').click();
            sidePanel.switchToTab('tab-preview');

            cy.get('[data-sel-role="preview-container"]').should('be.visible');
            cy.get('[data-sel-role="preview-viewport"]').should('not.exist');
            cy.get('[data-sel-role="preview-viewport-frame"]').should('not.exist');
        });
    });

    describe('Publication', () => {
        it('should not offer to publish a sample', () => {
            const jcontent = JContent.visit(siteKey, 'en', 'samples/components');
            jcontent.getTable().getRowByName('sample-source').contextMenu()
                .shouldNotHaveItem('Publish');
        });

        it('should mark a saved sample as never going live', () => {
            cy.apollo({
                query: gql`query sampleMixins($path: String!) {
                    jcr { node: nodeByPath(path: $path) {
                        nolive: isNodeType(type: {types: ["jmix:nolive"]})
                    } }
                }`,
                variables: {path: `${samplesPath}/components/sample-source`}
            }).should(result => {
                expect(result?.data?.jcr?.node?.nolive, 'a saved sample should carry jmix:nolive')
                    .to.equal(true);
            });
        });

        it('should leave a sample unpublished when a publish is aimed straight at it', () => {
            // Hiding the action by path covers one UI and nothing else - a GraphQL mutation, a
            // script or a scheduled publication all reach the node directly. Publishing the sample
            // and waiting for the job to end is what makes the negative assertion below meaningful:
            // without the wait it would pass simply by running before publication could happen.
            publishAndWaitJobEnding(`${samplesPath}/components/sample-source`, ['en']);

            cy.apollo({
                query: gql`query liveSamples($statement: String!) {
                    jcr(workspace: LIVE) {
                        nodesByQuery(query: $statement) { nodes { path } }
                    }
                }`,
                // Asserted against the live workspace rather than publicationStatus: core reports a
                // nolive node as PUBLISHED so it never shows up as pending work, so that status
                // would pass whether or not the node actually reached live.
                variables: {statement: `SELECT * FROM [nt:base] WHERE ISDESCENDANTNODE('${samplesPath}')`}
            }).should(result => {
                const live = result?.data?.jcr?.nodesByQuery?.nodes ?? [];
                expect(live.map(n => n.path), 'nothing from the samples branch should reach live')
                    .to.have.length(0);
            });
        });
    });

    describe('Refreshing the picker after a sample is saved', () => {
        it('should show a newly saved sample without reloading the page', () => {
            const jcontent = JContent.visit(siteKey, 'en', 'content-folders/contents');

            // Prime the query for a type that has no sample yet. The modal is mounted only while
            // the picker is open, so nothing invalidates this result once cached: served
            // cache-first, the empty list came back for the rest of the session.
            const beforeSaving = jcontent.getCreateContent().open().getContentTypeSelector();
            beforeSaving.searchForContentType('Rich').selectContentType('jnt:bigText');
            cy.get('[data-sel-role="sample-preview-empty"]').should('be.visible');
            beforeSaving.cancel();

            // Saved from the same page - no visit, no reload, which is the whole point here.
            jcontent.selectContextMenuByRowName('cache-source', 'copyToSamples');
            childNamesOf(`${samplesPath}/components`).should(result => {
                const names = (result?.data?.jcr?.node?.children?.nodes ?? []).map(n => n.name);
                expect(names).to.include('cache-source');
            });

            const afterSaving = jcontent.getCreateContent().open().getContentTypeSelector();
            afterSaving.searchForContentType('Rich').selectContentType('jnt:bigText');
            afterSaving.getSamplePreview().shouldRenderContaining('a rich example');
            afterSaving.cancel();
        });
    });
});
