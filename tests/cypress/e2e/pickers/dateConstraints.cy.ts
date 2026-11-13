// Migrated from the legacy Selenium class DatePickersTest (Jahia/selenium#1677), FT-001 to FT-012.

import {addNode, context, createSite, createUser, deleteUser, enableModule, grantRoles, jfaker} from '@jahia/cypress';
import gql from 'graphql-tag';
import {ContentEditor} from '../../page-object';

// Every site and user of this spec starts with this prefix, so a run can remove what an earlier run left behind.
const prefix = 'dateConstraints';
const uniqueName = (kind: string) => `${prefix}${kind}${jfaker.string.alphanumeric({length: 8, casing: 'lower'})}`;

const removeStaleFixtures = () => {
    cy.apollo({
        fetchPolicy: 'no-cache',
        query: gql`query staleFixtures($sites: String!, $users: String!) {
            jcr {
                sites: nodesByQuery(query: $sites) { nodes { name } }
                users: nodesByQuery(query: $users) { nodes { name } }
            }
        }`,
        variables: {
            sites: `SELECT * FROM [jnt:virtualsite] WHERE ISDESCENDANTNODE('/sites') AND LOCALNAME() LIKE '${prefix}%'`,
            users: `SELECT * FROM [jnt:user] WHERE LOCALNAME() LIKE '${prefix}%'`
        }
    }).then(result => {
        result.data.jcr.sites.nodes.forEach(({name}) => cy.executeGroovy('jcontent/deleteSite.groovy', {SITEKEY: name}));
        result.data.jcr.users.nodes.forEach(({name}) => deleteUser(name));
    });
};

// The time selector lists the day in 30-minute slots, from 00:00 to 23:30.
const ALL_SLOTS = Array.from({length: 48}, (_, i) => `${String(Math.floor(i / 2)).padStart(2, '0')}:${i % 2 ? '30' : '00'}`);
const slots = (from: string, to: string) => ALL_SLOTS.slice(ALL_SLOTS.indexOf(from), ALL_SLOTS.indexOf(to) + 1);

type DayCheck = {
    value: string;
    disabled: boolean;
    hidden?: string[];
    shown?: string[];
};

describe('Date picker range constraints', () => {
    const siteKey = uniqueName('site');
    const editor = uniqueName('editor');
    const password = 'password';
    const nodePath = `/sites/${siteKey}/contents/dateConstraintPickers`;

    // The editor types the value, then opens the picker: the selected day carries the disabled
    // state, and the time selector lists only the slots that the constraint allows on that day.
    const checkDays = (property: string, checks: DayCheck[]) => {
        const ce = ContentEditor.visit(nodePath, siteKey, 'en', 'content-folders/contents');
        checks.forEach(({value, disabled, hidden, shown}) => {
            const field = ce.getDateField(`qant:dateConstraint_${property}`);
            field.addNewValue(value, true);
            field.open();
            cy.get('.DayPicker-Day[aria-selected="true"]').should('have.attr', 'aria-disabled', String(disabled));
            if (hidden || shown) {
                cy.get('.TimePicker li').then($slots => {
                    const listed = [...$slots].map(slot => slot.innerText.trim());
                    (hidden || []).forEach(slot => expect(listed, `${value}: slot ${slot}`).not.to.include(slot));
                    (shown || []).forEach(slot => expect(listed, `${value}: slot ${slot}`).to.include(slot));
                });
            }

            field.close();
        });
    };

    before(() => {
        removeStaleFixtures();
        createSite(siteKey);
        enableModule('qa-module', siteKey);
        createUser(editor, password);
        grantRoles(`/sites/${siteKey}`, ['editor'], editor, 'USER');
        addNode({
            parentPathOrId: `/sites/${siteKey}/contents`,
            name: 'dateConstraintPickers',
            primaryNodeType: 'qant:dateConstraint'
        });
    });

    beforeEach(() => {
        cy.login(editor, password);
    });

    after(() => {
        cy.logout();
        cy.executeGroovy('jcontent/deleteSite.groovy', {SITEKEY: siteKey});
        deleteUser(editor);
    });

    it('disables the days before an exclusive lower bound', () => {
        context.tag('testrail-case-1682393', 'date-picker', 'date-lower-exclusive');
        checkDays('dateConstraintLowerBoudaries', [
            {value: '06/03/2019', disabled: true},
            {value: '06/04/2019', disabled: true},
            {value: '06/05/2019', disabled: false}
        ]);
    });

    it('disables the days after an exclusive upper bound', () => {
        context.tag('testrail-case-1682393', 'date-picker', 'date-upper-exclusive');
        checkDays('dateConstraintUpperBoudaries', [
            {value: '06/19/2021', disabled: false},
            {value: '06/20/2021', disabled: true},
            {value: '06/21/2021', disabled: true}
        ]);
    });

    it('disables the days outside an exclusive range', () => {
        context.tag('testrail-case-1682393', 'date-picker', 'date-both-exclusive');
        checkDays('dateConstraintBothBoudaries', [
            {value: '06/03/2019', disabled: true},
            {value: '06/04/2019', disabled: true},
            {value: '06/05/2019', disabled: false},
            {value: '06/19/2021', disabled: false},
            {value: '06/20/2021', disabled: true},
            {value: '06/21/2021', disabled: true}
        ]);
    });

    it('keeps an inclusive lower bound enabled', () => {
        context.tag('testrail-case-1682393', 'date-picker', 'date-lower-inclusive');
        checkDays('dateConstraintLowerBoudariesInc', [
            {value: '06/03/2019', disabled: true},
            {value: '06/04/2019', disabled: false},
            {value: '06/05/2019', disabled: false}
        ]);
    });

    it('keeps an inclusive upper bound enabled', () => {
        context.tag('testrail-case-1682393', 'date-picker', 'date-upper-inclusive');
        checkDays('dateConstraintUpperBoudariesInc', [
            {value: '06/19/2021', disabled: false},
            {value: '06/20/2021', disabled: false},
            {value: '06/21/2021', disabled: true}
        ]);
    });

    it('disables the days outside an inclusive range', () => {
        context.tag('testrail-case-1682393', 'date-picker', 'date-both-inclusive');
        checkDays('dateConstraintBothBoudariesInc', [
            {value: '06/03/2019', disabled: true},
            {value: '06/04/2019', disabled: false},
            {value: '06/05/2019', disabled: false},
            {value: '06/19/2021', disabled: false},
            {value: '06/20/2021', disabled: false},
            {value: '06/21/2021', disabled: true}
        ]);
    });

    it('hides the time slots before an exclusive lower bound', () => {
        context.tag('testrail-case-1682393', 'datetime-picker', 'datetime-lower-exclusive');
        checkDays('datetimeConstraintLowerBoudaries', [
            {value: '06/03/2019 05:00', disabled: true},
            {value: '06/04/2019 05:00', disabled: false, hidden: slots('00:00', '05:00'), shown: slots('05:30', '23:30')},
            {value: '08/10/2019 15:00', disabled: false, shown: ALL_SLOTS}
        ]);
    });

    it('hides the time slots after an exclusive upper bound', () => {
        context.tag('testrail-case-1682393', 'datetime-picker', 'datetime-upper-exclusive');
        checkDays('datetimeConstraintUpperBoudaries', [
            {value: '08/10/2019 15:00', disabled: false, shown: ALL_SLOTS},
            {value: '06/20/2021 04:00', disabled: false, hidden: slots('05:30', '23:30'), shown: slots('00:00', '05:00')},
            {value: '05/04/2023 10:00', disabled: true}
        ]);
    });

    it('hides the time slots outside an exclusive range', () => {
        context.tag('testrail-case-1682393', 'datetime-picker', 'datetime-both-exclusive');
        checkDays('datetimeConstraintBothBoudaries', [
            {value: '06/03/2019 05:00', disabled: true},
            {value: '06/04/2019 05:00', disabled: false, hidden: slots('00:00', '05:00'), shown: slots('05:30', '23:30')},
            {value: '08/10/2019 15:00', disabled: false, shown: ALL_SLOTS},
            {value: '06/20/2021 04:00', disabled: false, hidden: slots('05:30', '23:30'), shown: slots('00:00', '05:00')},
            {value: '05/04/2023 10:00', disabled: true}
        ]);
    });

    it('lists the slot of an inclusive lower bound', () => {
        context.tag('testrail-case-1682393', 'datetime-picker', 'datetime-lower-inclusive');
        checkDays('datetimeConstraintLowerBoudariesInc', [
            {value: '06/03/2019 05:00', disabled: true},
            {value: '06/04/2019 05:00', disabled: false, hidden: slots('00:00', '04:30'), shown: slots('05:00', '23:30')},
            {value: '08/10/2019 15:00', disabled: false, shown: ALL_SLOTS}
        ]);
    });

    it('hides the time slots after an inclusive upper bound', () => {
        context.tag('testrail-case-1682393', 'datetime-picker', 'datetime-upper-inclusive');
        checkDays('datetimeConstraintUpperBoudariesInc', [
            {value: '08/10/2019 15:00', disabled: false, shown: ALL_SLOTS},
            {value: '06/20/2021 04:00', disabled: false, hidden: slots('05:30', '23:30'), shown: slots('00:00', '05:00')},
            {value: '05/04/2023 10:00', disabled: true}
        ]);
    });

    it('hides the time slots outside an inclusive range', () => {
        context.tag('testrail-case-1682393', 'datetime-picker', 'datetime-both-inclusive');
        checkDays('datetimeConstraintBothBoudariesInc', [
            {value: '06/03/2019 05:00', disabled: true},
            {value: '06/04/2019 05:00', disabled: false, hidden: slots('00:00', '05:00'), shown: slots('05:30', '23:30')},
            {value: '08/10/2019 15:00', disabled: false, shown: ALL_SLOTS},
            {value: '05/04/2023 10:00', disabled: true}
        ]);
    });
});
