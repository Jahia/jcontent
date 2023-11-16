import {JContent, JContentPageBuilder} from '../../page-object';
import {createSite, deleteSite, Dropdown, getComponentByRole} from '@jahia/cypress';
import {addPageGql, addContentGql} from '../../fixtures/jcontent/pageComposer/setLimitContent';
import {ContentEditor} from '../../page-object';

describe('Page builder', () => {
    let jcontent: JContentPageBuilder;

    beforeEach(() => {
        cy.loginAndStoreSession();
        jcontent = JContent.visit('digitall', 'en', 'pages/home').switchToPageBuilder();
    });

    it('should switch language', () => {
        jcontent.iframe().get().find('#languages.pull-right').click();
        jcontent.iframe().get().find('#languages.pull-right').contains('German').click();
        jcontent.getLanguageSwitcher().get().contains('de');
    });
});
