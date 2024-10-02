import {JContent} from '../../page-object';
import gql from 'graphql-tag';

describe('Open in repo explorer tests', () => {
    let expectedUrl = null;
    before(() => {
        cy.loginAndStoreSession(); // Edit in chief
        cy.apollo({
            query: gql`
                query {
                    jcr {
                        nodeByPath(path: "/sites/digitall/contents/person-portrait-1"){
                            site {
                                uuid
                            }
                        }
                    }
                }
            `
        }).then(result => {
            const siteId = result.data.jcr.nodeByPath.site.uuid;
            const encodedPath = encodeURIComponent('/sites/digitall/contents/person-portrait-1');
            expectedUrl = `/jahia/repository-explorer?site=${siteId}&selectedPaths=${encodedPath}`;
        });
    });

    after(function () {
        cy.logout();
    });

    it('shows preview on content folder item', () => {
        const jcontent = JContent.visit('digitall', 'en', 'content-folders/contents', {
            onBeforeLoad(win: Window) {
                // @ts-expect-error window definition does not have "open" for some reason
                cy.stub(win, 'open');
            }
        });
        jcontent
            .getTable()
            .getRowByLabel('Taber')
            .contextMenu()
            .select('Show in Repository Explorer');
        cy.window().its('open').should('be.calledWith', expectedUrl);
    });
});
