import {JContent} from '../../page-object';
import {addNode} from '@jahia/cypress';
import {MultipleLeftRightField} from '../../page-object/fields/multipleLeftRightField';

describe('constraints', () => {
    let jcontent: JContent;

    before(() => {
        cy.executeGroovy('jcontent/createSite.groovy', {SITEKEY: 'jcontentSite'});
        addNode({parentPathOrId: '/sites/jcontentSite/home', primaryNodeType: 'jnt:contentList', name: 'list'});
    });

    after(() => {
        cy.logout();
        cy.executeGroovy('jcontent/deleteSite.groovy', {SITEKEY: 'jcontentSite'});
    });

    beforeEach(() => {
        cy.loginAndStoreSession();
        jcontent = JContent
            .visit('jcontentSite', 'en', 'pages/home')
            .switchToStructuredView();
    });

    it('can set restrictions', function () {
        const contentEditor = jcontent.editComponentByText('list');
        contentEditor.closeSection('Content');
        contentEditor.toggleOption('jmix:contributeMode', 'Content type restrictions');
        contentEditor.getField(MultipleLeftRightField, 'jmix:contributeMode_j:contributeTypes', true)
            .addNewValue('Banner')
            .addNewValue('Breadcrumb');
        contentEditor.save();
    });
});

