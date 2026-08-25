import {addNode, createSite, createUser, deleteSite, deleteUser, grantRoles} from '@jahia/cypress';

import {ContentEditor} from '../../page-object/contentEditor';
import {GraphqlUtils} from '../../utils/graphqlUtils';
import {localWallClockToUtcIso, WallClock} from '../../utils/timeUtils';

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
        const dateField = ce.getDateField('qant:pickers_datepicker');
        dateField.checkValue('');
        const today = dateField.getTodayDate();
        dateField.pickTodayDate();
        dateField.checkValue(today);
    });

    it('Test without using picker', () => {
        cy.login();
        const ce = ContentEditor.visit('/sites/testsite/contents/contentEditorPickers', 'testsite', 'en', 'content-folders/contents');
        const dateField = ce.getDateField('qant:pickers_datepicker');
        const today = dateField.getTodayDate();
        dateField.checkValue('');
        dateField.addNewValue(today);
        dateField.checkValue(today);
    });

    it('Test Date time Picker without using picker', () => {
        cy.login();
        const ce = ContentEditor.visit('/sites/testsite/contents/contentEditorPickers', 'testsite', 'en', 'content-folders/contents');
        const dateField = ce.getDateField('qant:pickers_datetimepicker');
        dateField.checkValue('');
        dateField.pickTodayDate();
        dateField.checkValue(dateField.getTodayDate() + ' 00:00');
        dateField.select({time: '11:00'});
        dateField.checkValue(dateField.getTodayDate() + ' 11:00');
    });

    it('Test Date Picker with spanish user', () => {
        cy.login('myUser', 'password');
        const ce = ContentEditor.visit('/sites/testsite/contents/contentEditorPickers', 'testsite', 'en', 'content-folders/contents');
        const dateField = ce.getDateField('qant:pickers_datepicker');
        dateField.checkValue('');
        const today = dateField.getTodayDate();
        dateField.pickTodayDate();
        dateField.checkValue(today);
    });

    it('stores UTC value and browser displays localized datetime', () => {
        const nodePath = '/sites/testsite/contents/contentEditorPickers';

        const assertStoredAsUtc = (wallClock: WallClock) => {
            GraphqlUtils.getPropertyValue(nodePath, 'datetimepicker').then(rawValue => {
                // Genuinely UTC -- not the old NOT_ZONED_DATE convention, which would carry the
                // SERVER's own offset (e.g. "+01:00") instead of "Z".
                expect(rawValue).to.match(/Z$/);
                expect(new Date(rawValue as string).toISOString()).to.equal(localWallClockToUtcIso(wallClock));
            });
        };

        cy.login();

        // Phase 1: America/Toronto (UTC-5 in January). Close to local midnight, so a broken
        // conversion would visibly shift the CALENDAR DAY too, not just the hour.
        cy.setBrowserTimezone('America/Toronto');
        let ce = ContentEditor.visit('/sites/testsite/contents/contentEditorPickers', 'testsite', 'en', 'content-folders/contents');
        let dateField = ce.getDateField('qant:pickers_datetimepicker');
        dateField.addNewValue('01/15/2027 23:30');
        ce.save();
        assertStoredAsUtc({timezoneId: 'America/Toronto', year: 2027, month: 1, day: 15, hour: 23, minute: 30});

        // Fresh page navigation (not just re-reading in-memory state), same overridden timezone --
        // proves the READ path also correctly converts the now-verified UTC instant back to the
        // same local wall clock, not just that the write happened to be right.
        ce = ContentEditor.visit('/sites/testsite/contents/contentEditorPickers', 'testsite', 'en', 'content-folders/contents');
        ce.getDateField('qant:pickers_datetimepicker').checkValue('01/15/2027 23:30');

        // Phase 2: Asia/Tokyo (UTC+9, no DST) -- a completely different, opposite-sign offset,
        // proving the conversion tracks the BROWSER's timezone rather than some fixed value that
        // happened to produce the right answer once.
        cy.setBrowserTimezone('Asia/Tokyo');
        ce = ContentEditor.visit('/sites/testsite/contents/contentEditorPickers', 'testsite', 'en', 'content-folders/contents');
        dateField = ce.getDateField('qant:pickers_datetimepicker');
        dateField.addNewValue('02/09/2027 08:15');
        ce.save();
        assertStoredAsUtc({timezoneId: 'Asia/Tokyo', year: 2027, month: 2, day: 9, hour: 8, minute: 15});

        ce = ContentEditor.visit('/sites/testsite/contents/contentEditorPickers', 'testsite', 'en', 'content-folders/contents');
        ce.getDateField('qant:pickers_datetimepicker').checkValue('02/09/2027 08:15');
    });

    it('Test Date Picker stores the exact calendar day regardless of browser timezone', () => {
        const nodePath = '/sites/testsite/contents/contentEditorPickers';

        cy.login();

        // Europe/Paris is UTC+1 in January (no DST) -- a positive offset, so a broken conversion
        // that treats local midnight as a real UTC instant would roll the stored calendar day
        // back by one (midnight Jan 15 Paris = 23:00 Jan 14 UTC).
        cy.setBrowserTimezone('Europe/Paris');
        let ce = ContentEditor.visit(nodePath, 'testsite', 'en', 'content-folders/contents');
        ce.getDateField('qant:pickers_datepicker').addNewValue('01/15/2027');
        ce.save();

        // A date-only field has no time-of-day, so there is no legitimate "instant" for it to be
        // converted through -- the calendar day is the only thing that matters, and the raw
        // stored value must carry it literally, not shifted by whichever timezone happened to
        // write it.
        GraphqlUtils.getPropertyValue(nodePath, 'datepicker').then(rawValue => {
            expect(rawValue).to.match(/^2027-01-15/);
        });

        // Reading it back from a DIFFERENT, "further behind" timezone must show the exact same
        // day -- proving the stored value isn't an instant whose calendar day shifts per viewer.
        cy.setBrowserTimezone('Pacific/Honolulu');
        ce = ContentEditor.visit(nodePath, 'testsite', 'en', 'content-folders/contents');
        ce.getDateField('qant:pickers_datepicker').checkValue('01/15/2027');
    });

    it('Test Date time Picker shows a validation error for an out-of-range typed value', () => {
        cy.login();
        const ce = ContentEditor.visit('/sites/testsite/contents/contentEditorPickers', 'testsite', 'en', 'content-folders/contents');
        const dateField = ce.getDateField('qant:pickers_datetimepicker');
        dateField.get().find('input[type="text"]').clear().type('99/99/9999 99:99', {force: true});
        // Validation only runs on blur/save in this form; click to trigger
        cy.get('body').click();
        dateField.getErrorMessage('invalidDate').should('be.visible');
    });
});
