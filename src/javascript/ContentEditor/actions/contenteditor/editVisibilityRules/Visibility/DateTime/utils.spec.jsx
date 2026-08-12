import {buildNewCondition, buildUpdatedCondition, getConditionLabel} from './utils';

// Mock the workspace date-formatter so we can assert the locale is threaded through and control output.
jest.mock('date-formatter', () => {
    const dayNames = {
        monday: 'lundi',
        tuesday: 'mardi',
        wednesday: 'mercredi',
        thursday: 'jeudi',
        friday: 'vendredi',
        saturday: 'samedi',
        sunday: 'dimanche'
    };
    return {
        formatDatetime: (date, opts) => `${date}|${opts.locale}|${opts.format}`,
        formatTime: (time, opts) => `${time}|${opts.locale}|LT`,
        formatDayOfWeek: day => dayNames[String(day).toLowerCase()]
    };
}, {virtual: true});

// Translation mock: interpolates the sentence keys, mirroring i18next.
const t = (key, opts = {}) => {
    if (key.endsWith('dayOfWeekCondition')) {
        return `Jours : ${opts.days}`;
    }

    if (key.endsWith('startTimeCondition')) {
        return `A partir de ${opts.startTime}`;
    }

    if (key.endsWith('startDateCondition')) {
        return `A partir du ${opts.startDate}`;
    }

    return key;
};

describe('getConditionLabel', () => {
    it('localises day-of-week values instead of showing raw English keys', () => {
        const properties = [{name: 'dayOfWeek', values: ['sunday', 'monday']}];
        expect(getConditionLabel('jnt:dayOfWeekCondition', properties, t, 'fr')).toBe('Jours : dimanche, lundi');
    });

    it('is case-insensitive on the stored day values', () => {
        const properties = [{name: 'dayOfWeek', values: ['SUNDAY']}];
        expect(getConditionLabel('jnt:dayOfWeekCondition', properties, t, 'fr')).toBe('Jours : dimanche');
    });

    it('handles a missing dayOfWeek property without throwing', () => {
        expect(getConditionLabel('jnt:dayOfWeekCondition', [], t, 'fr')).toBe('Jours : ');
    });

    it('formats the time condition in the UI locale (LT respects fr/de)', () => {
        const properties = [{name: 'startHour', value: '14'}, {name: 'startMinute', value: '30'}];
        expect(getConditionLabel('jnt:timeOfDayCondition', properties, t, 'fr')).toBe('A partir de 14:30|fr|LT');
    });

    it('formats the date condition in the UI locale', () => {
        const properties = [{name: 'start', notZonedDateValue: '2026-07-22T10:00:00.000'}];
        expect(getConditionLabel('jnt:startEndDateCondition', properties, t, 'de'))
            .toBe('A partir du 2026-07-22T10:00:00.000|de|long');
    });

    it('reads the zone-less server value, ignoring a stale/shifted raw value', () => {
        const properties = [{name: 'start', value: '2026-07-22T09:00:00.000Z', notZonedDateValue: '2026-07-22T10:00:00.000'}];
        expect(getConditionLabel('jnt:startEndDateCondition', properties, t, 'de'))
            .toBe('A partir du 2026-07-22T10:00:00.000|de|long');
    });
});

describe('buildNewCondition / buildUpdatedCondition', () => {
    it('marks start/end date properties as NOT_ZONED_DATE, passing the zone-less value through unchanged', () => {
        const rule = {type: 'jnt:startEndDateCondition', start: '2027-01-01T00:00:00.000', end: '2027-01-02T00:00:00.000'};
        expect(buildNewCondition(rule)).toEqual({
            type: 'jnt:startEndDateCondition',
            properties: [
                {name: 'start', value: '2027-01-01T00:00:00.000', type: 'DATE', option: 'NOT_ZONED_DATE'},
                {name: 'end', value: '2027-01-02T00:00:00.000', type: 'DATE', option: 'NOT_ZONED_DATE'}
            ]
        });
    });

    it('leaves non-date properties untouched, with no type/option fields', () => {
        const rule = {type: 'jnt:dayOfWeekCondition', dayOfWeek: ['monday', 'tuesday']};
        expect(buildNewCondition(rule)).toEqual({
            type: 'jnt:dayOfWeekCondition',
            properties: [{name: 'dayOfWeek', values: ['monday', 'tuesday']}]
        });
    });

    it('omits an empty end date rather than sending an unparsable NOT_ZONED_DATE value', () => {
        const rule = {type: 'jnt:startEndDateCondition', start: '2027-01-01T00:00:00.000', end: ''};
        const result = buildNewCondition(rule);
        expect(result.properties.find(p => p.name === 'end')).toBeUndefined();
        expect(result.properties).toEqual([
            {name: 'start', value: '2027-01-01T00:00:00.000', type: 'DATE', option: 'NOT_ZONED_DATE'}
        ]);
    });

    it('includes the uuid for an updated condition', () => {
        const rule = {type: 'jnt:startEndDateCondition', uuid: 'abc-123', start: '2027-01-01T00:00:00.000'};
        expect(buildUpdatedCondition(rule)).toEqual({
            type: 'jnt:startEndDateCondition',
            uuid: 'abc-123',
            properties: [{name: 'start', value: '2027-01-01T00:00:00.000', type: 'DATE', option: 'NOT_ZONED_DATE'}],
            deletedProperties: []
        });
    });

    it('deletes a date cleared to an empty string, rather than silently leaving the old value in place', () => {
        const rule = {type: 'jnt:startEndDateCondition', uuid: 'abc-123', start: '2027-01-01T00:00:00.000', end: ''};
        expect(buildUpdatedCondition(rule)).toEqual({
            type: 'jnt:startEndDateCondition',
            uuid: 'abc-123',
            properties: [{name: 'start', value: '2027-01-01T00:00:00.000', type: 'DATE', option: 'NOT_ZONED_DATE'}],
            deletedProperties: ['end']
        });
    });

    it('deletes a date cleared to null (DatePickerInput\'s own clear path), same as an empty string', () => {
        const rule = {type: 'jnt:startEndDateCondition', uuid: 'abc-123', start: null, end: '2027-01-02T00:00:00.000'};
        expect(buildUpdatedCondition(rule)).toEqual({
            type: 'jnt:startEndDateCondition',
            uuid: 'abc-123',
            properties: [{name: 'end', value: '2027-01-02T00:00:00.000', type: 'DATE', option: 'NOT_ZONED_DATE'}],
            deletedProperties: ['start']
        });
    });

    it('does not ask to delete a non-date property left falsy — only start/end get the delete treatment', () => {
        const rule = {type: 'jnt:timeOfDayCondition', uuid: 'abc-123', startHour: ''};
        expect(buildUpdatedCondition(rule)).toEqual({
            type: 'jnt:timeOfDayCondition',
            uuid: 'abc-123',
            properties: [{name: 'startHour', value: ''}],
            deletedProperties: []
        });
    });
});
