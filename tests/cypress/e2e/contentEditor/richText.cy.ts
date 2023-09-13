import {JContent} from '../../page-object';
import {addNode} from '@jahia/cypress';
import {MultipleLeftRightField} from '../../page-object/fields/multipleLeftRightField';
import {RichTextField} from '../../page-object/fields';

describe('constraints', {testIsolation: false}, () => {
    let jcontent: JContent;
    let contentEditor;
    let richText;

    before(() => {
        cy.window().then(win => {
            win.navigator.clipboard.writeText('test');
        });
        cy.loginAndStoreSession();
        jcontent = JContent
            .visit('digitall', 'en', 'pages/home')
            .switchToListMode();
        contentEditor = jcontent.editComponentByText('Digitall’s global network');
    });

    beforeEach(() => {
        richText = contentEditor.getField(RichTextField, 'jnt:bigText_text');
    });

    it('can edit rich text with ckeditor', function () {
        richText.type('test');
    });

    it('shows ckeditor notifications', function () {
        richText.get().find('.cke_button__paste_icon').click();
        cy.get('.cke_notifications_area');
    });
});

