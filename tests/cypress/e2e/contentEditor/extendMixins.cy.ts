import {JContent} from '../../page-object';
import {SmallTextField} from '../../page-object/fields';

describe('Extend Mixins tests with CE', () => {
    before(() => {
        cy.loginAndStoreSession();
    });

    it('Applies extend mixin only if it is enabled on the node', () => {
        const jcontent = JContent.visit('digitall', 'en', 'pages');
        const contentEditor = jcontent.editComponentByText('home');
        const readOnlySystemname = contentEditor.getField(SmallTextField, 'j:systemName');
        readOnlySystemname.isWritable();

        const readOnlyMixin = contentEditor.getField(SmallTextField, 'j:isHomePage');
    });

    after(() => {
        cy.logout();
    });
});
