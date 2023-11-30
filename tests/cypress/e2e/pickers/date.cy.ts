import {addNode, createSite, createUser, deleteSite, deleteUser, grantRoles} from '@jahia/cypress';

import {ContentEditor} from '../../page-object/contentEditor';
import {DateField} from '../../page-object/fields';

describe('Date picker tests', () => {
    before('Create required content', () => {
        createSite('testsite');
        createUser('myUser', 'password', [{name: 'preferredLanguage', value: 'es'}]);
        grantRoles('/sites/testsite', ['editor'], 'myUser', 'USER');
        addNode({
            parentPathOrId: '/sites/testsite/contents',
            name: 'contentEditorPickers',
            primaryNodeType: 'qant:pickers'
        });
    });

    after('Remove tests content', () => {
        deleteUser('myUser');
        deleteSite('testsite');
    });

    it('Test Date Picker', () => {
        cy.login();
        const ce = ContentEditor.visit('/sites/testsite/contents/contentEditorPickers', 'testsite', 'en', 'content-folders/contents');
        const dateField = ce.getField(DateField, 'qant:pickers_datepicker', false);
        dateField.checkValue('');
        const today = dateField.getTodayDate();
        dateField.pickTodayDate();
        dateField.checkValue(today);
    });

    it('Test without using picker', () => {
        cy.login();
        const ce = ContentEditor.visit('/sites/testsite/contents/contentEditorPickers', 'testsite', 'en', 'content-folders/contents');
        const dateField = ce.getField(DateField, 'qant:pickers_datepicker', false);
        const today = dateField.getTodayDate();
        dateField.checkValue('');
        dateField.addNewValue(today);
        dateField.checkValue(today);
    });

    it('Test Date time Picker without using picker', () => {
        cy.login();
        const ce = ContentEditor.visit('/sites/testsite/contents/contentEditorPickers', 'testsite', 'en', 'content-folders/contents');
        const dateField = ce.getField(DateField, 'qant:pickers_datetimepicker', false);
        dateField.checkValue('');
        dateField.pickTodayDate();
        dateField.checkValue(dateField.getTodayDate() + ' 00:00');
        dateField.select({time: '11:00'});
        dateField.checkValue(dateField.getTodayDate() + ' 11:00');
    });

    it('Test Date Picker with spanish user', () => {
        cy.login('myUser', 'password');
        const ce = ContentEditor.visit('/sites/testsite/contents/contentEditorPickers', 'testsite', 'en', 'content-folders/contents');
        const dateField = ce.getField(DateField, 'qant:pickers_datepicker', false);
        dateField.checkValue('');
        const today = dateField.getTodayDate();
        dateField.pickTodayDate();
        dateField.checkValue(today);
    });
});
