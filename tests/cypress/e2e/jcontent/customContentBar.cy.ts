import {JContent} from '../../page-object';
import {addNode, deleteNode} from '@jahia/cypress';

describe('Custom content bar test', () => {
    const pageName = 'testPage';
    beforeEach(() => {
        cy.login();
        addNode({
            parentPathOrId: '/sites/digitall/home',
            name: pageName,
            primaryNodeType: 'jnt:page',
            properties: [
                {name: 'jcr:title', language: 'en', value: pageName},
                {name: 'j:templateName', value: 'simple'}
            ],
            children: [{
                name: 'area-main', primaryNodeType: 'jnt:contentList'
            }]
        }).then(() => {
            addNode({
                parentPathOrId: `/sites/digitall/home/${pageName}/area-main`,
                name: 'default-value-test',
                primaryNodeType: 'cent:defaultValueTest'
            });
        });
    });

    afterEach(() => {
        deleteNode(`/sites/digitall/home/${pageName}`);
    });

    it('Check if custom bar is always displayed in page builder', () => {
        const jcontentPageBuilder = JContent
            .visit('digitall', 'en', `pages/home/${pageName}`)
            .switchToPageBuilder();
        const pageBuilderModuleHeader = jcontentPageBuilder
            .getModule(`/sites/digitall/home/${pageName}/area-main/default-value-test`)
            .getHeader();
        pageBuilderModuleHeader.get().should('exist');
        pageBuilderModuleHeader.get().find('div').contains('This is a custom bar').should('exist');
    });
});
