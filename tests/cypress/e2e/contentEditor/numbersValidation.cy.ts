import {createSite, deleteSite, enableModule} from '@jahia/cypress';
import {JContent} from '../../page-object';
import {SmallTextField} from '../../page-object/fields';

describe('Numbers validation tests', {testIsolation: false}, () => {
    const siteKey = 'validation';
    let jcontent : JContent;

    before(function () {
        createSite(siteKey);
        enableModule('jcontent-test-module', siteKey);
        cy.login();
        jcontent = JContent
            .visit(siteKey, 'en', 'content-folders/contents')
            .switchToListMode();
    });

    after(function () {
        deleteSite(siteKey);
    });

    it('gives appropriate feedback for incorrect number types', () => {
        const ce = jcontent.createContent('cent:numbers');
        // Required field checked
        ce.createUnchecked();
        cy.contains('There is one validation error').find('a').contains('longReq');
        ce.discardErrorDialog();

        // Make sure chars are not allowed
        ce.getField(SmallTextField, 'cent:numbers_longReq', false).addNewValue('234');
        ce.getField(SmallTextField, 'cent:numbers_long', false).addNewValue('2.3e-+tty34', false, false);
        ce.getField(SmallTextField, 'cent:numbers_long', false).checkValue('-2334');
        ce.getField(SmallTextField, 'cent:numbers_double', false).addNewValue('32.45##df4ee', false, false);
        ce.getField(SmallTextField, 'cent:numbers_double', false).checkValue('32.454');
        ce.createUnchecked();

        cy.contains('There is one validation error').should('not.exist');
    });
});
