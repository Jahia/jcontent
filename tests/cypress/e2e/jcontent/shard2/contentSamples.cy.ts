import {addNode, createSite, createUser, deleteSite, deleteUser, enableModule, grantRoles} from '@jahia/cypress';
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
                // Carried through the supertype list, so mixinTypes stays empty and the mixin is
                // never handed to a copy - see the publication assertion further down.
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
            // The regression this guards: jmix:nolive on a sample would travel with the copy, since
            // node copy re-adds every mixin absent from forbiddenMixinToCopy, and the inserted
            // content would be silently unpublishable forever.
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
    });
});
