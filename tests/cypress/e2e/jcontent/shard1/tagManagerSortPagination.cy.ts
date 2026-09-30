import {addNode, context, createSite, deleteSite, getNodeByPath, jfaker} from '@jahia/cypress';
import {TagManager} from '../../../page-object';

describe('Tag Manager sort and pagination', () => {
    const siteKeyPrefix = 'tagManagerSortPagination';
    const siteKey = `${siteKeyPrefix}${jfaker.string.alphanumeric({length: 8, casing: 'lower', safe: true})}`;
    // Tags are stored in lowercase, so only accents are ignored: an accent-sensitive sort would put ça last
    const sortedTags = ['aaa', 'ça', 'edd', 'eee', 'fff', 'rrr', 'sss', 'test', 'uuu', 'vvv', 'xxx', 'yyyy', 'zzz'];
    const shuffledTags = ['zzz', 'test', 'ça', 'uuu', 'aaa', 'yyyy', 'rrr', 'eee', 'xxx', 'fff', 'sss', 'vvv', 'edd'];

    const deleteStaleSites = () => {
        getNodeByPath('/sites', [], 'en', ['jnt:virtualsite']).then(({data}) => {
            data.jcr.nodeByPath.children.nodes
                .map(({name}) => name)
                .filter(name => name.startsWith(siteKeyPrefix))
                .forEach(name => deleteSite(name));
        });
    };

    const getRowNames = $rows => [...$rows].map(row => row.dataset.tagName);

    before(() => {
        deleteStaleSites();
        createSite(siteKey, {
            templateSet: 'jcontent-test-template',
            serverName: 'localhost',
            locale: 'en'
        });
        addNode({
            parentPathOrId: `/sites/${siteKey}/contents`,
            name: 'tagged-content',
            primaryNodeType: 'jnt:contentList',
            mixins: ['jmix:tagged'],
            properties: [
                {name: 'jcr:title', value: 'Tagged content', language: 'en'},
                {name: 'j:tagList', values: shuffledTags}
            ]
        });
    });

    after(() => {
        cy.logout();
        deleteSite(siteKey);
    });

    beforeEach(() => {
        cy.loginAndStoreSession();
    });

    it('lists the tags in alphabetical order, ignoring accents', () => {
        context.tag('tags', 'tag-manager', 'sort');
        const tagManager = TagManager.openFromAdditionalApps(siteKey, 'en');

        tagManager.getRows().should($rows => {
            expect(getRowNames($rows)).to.deep.equal(sortedTags);
        });
    });

    it('shows 10 tags per page', () => {
        context.tag('tags', 'tag-manager', 'rows-per-page');
        const tagManager = TagManager.visit(siteKey, 'en');
        tagManager.getRows().should('have.length', sortedTags.length);

        tagManager.setRowsPerPage(10);

        tagManager.getRows().should('have.length', 10);
    });

    it('shows the remaining tags on the next page', () => {
        context.tag('tags', 'tag-manager', 'next-page');
        const tagManager = TagManager.visit(siteKey, 'en');
        tagManager.setRowsPerPage(10);
        tagManager.getRows().should('have.length', 10);

        tagManager.goToNextPage();

        tagManager.getRows().should($rows => {
            expect(getRowNames($rows)).to.deep.equal(sortedTags.slice(10));
        });
    });
});
