import {createSite, deleteSite, enableModule, getNodeByPath} from '@jahia/cypress';
import {ContentEditor, JContent} from '../../page-object';
import {SmallTextField} from '../../page-object/fields';

describe('Numbers validation tests', {testIsolation: false}, () => {
    const siteKey = 'numberValidationSite';

    before(function () {
        createSite(siteKey);
        enableModule('jcontent-test-module', siteKey);
        cy.login();
    });

    after(function () {
        cy.executeGroovy('user/setPreferredLanguage.groovy', {USERNAME: 'root', LANGUAGE: 'en'});
        deleteSite(siteKey);
    });

    it('gives appropriate feedback for incorrect number types', () => {
        const jcontent = JContent
            .visit(siteKey, 'en', 'content-folders/contents')
            .switchToListMode();
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

    it('gives appropriate feedback for incorrect number types using different lang format (fr)', () => {
        cy.executeGroovy('user/setPreferredLanguage.groovy', {USERNAME: 'root', LANGUAGE: 'fr'});
        const jcontent = JContent
            .visit(siteKey, 'en', 'content-folders/contents')
            .switchToListMode();
        let ce = jcontent.createContent('cent:numbers');

        cy.log('Required field is checked');
        ce.createUnchecked();
        ce.discardErrorDialog();
        ce.assertValidationErrorsExists().contains('longReq');

        cy.log('Make sure chars are not allowed, but locale separators are accepted');
        ce.getField(SmallTextField, 'cent:numbers_longReq', false).addNewValue('234');
        ce.getField(SmallTextField, 'cent:numbers_long', false).addNewValue('2.3e-+tty34', false, false);
        ce.getField(SmallTextField, 'cent:numbers_long', false).checkValue('-2334');
        ce.getField(SmallTextField, 'cent:numbers_double', false).addNewValue('-32.45##df4ee', false, false);
        ce.getField(SmallTextField, 'cent:numbers_double', false).checkValue('-32,454');
        ce.getField(SmallTextField, 'cent:numbers_double2', false).addNewValue('420,67');
        ce.getField(SmallTextField, 'cent:numbers_double3', false).addNewValue('1000');

        ce.getField(SmallTextField, 'nt:base_ce:systemName', false).addNewValue('numbers-fr');
        ce.create();

        cy.log('Verify displayed values are formatted correctly (fr)');
        jcontent.getTable().getRowByName('numbers-fr').contextMenu().selectByRole('edit');
        ce = new ContentEditor();
        ce.getField(SmallTextField, 'cent:numbers_longReq', false).addNewValue('234');
        ce.getField(SmallTextField, 'cent:numbers_long', false).checkValue('-2334');
        ce.getField(SmallTextField, 'cent:numbers_double', false).checkValue('-32,454');
        ce.getField(SmallTextField, 'cent:numbers_double2', false).checkValue('420,67');
        ce.getField(SmallTextField, 'cent:numbers_double3', false).checkValue('1000,0');
        ce.cancel();

        getNodeByPath(`/sites/${siteKey}/contents/numbers-fr`, [
            'long', 'longReq', 'double', 'double2', 'double3'
        ]).then(resp => {
            cy.log('Verify values are stored correctly');
            const {properties} = resp.data?.jcr.nodeByPath;
            expect(properties?.length).to.be.greaterThan(0);

            const getValue = (propName: string) => properties.find(prop => prop.name === propName)?.value;
            expect(getValue('long')).to.eq('-2334');
            expect(getValue('longReq')).to.eq('234');
            expect(getValue('double')).to.eq('-32.454');
            expect(getValue('double2')).to.eq('420.67');
            expect(getValue('double3')).to.eq('1000.0');
        });

        cy.executeGroovy('user/setPreferredLanguage.groovy', {USERNAME: 'root', LANGUAGE: 'en'});
    });
});
