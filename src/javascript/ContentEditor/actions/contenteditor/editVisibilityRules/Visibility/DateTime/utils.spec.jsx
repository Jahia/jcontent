import {getConditionLabel} from './utils';

// Mock the workspace date-formatter so we can assert the locale is threaded through and control output.
jest.mock('date-formatter', () => ({
    dayjs: input => ({
        locale: loc => ({
            format: fmt => `${input}|${loc}|${fmt}`
        })
    }),
    formatDatetime: (date, opts) => `${date}|${opts.locale}|${opts.format}`
}), {virtual: true});

// Translation mock: resolves day-name keys to readable names and interpolates the sentence keys, mirroring i18next.
const dayNames = {
    monday: 'lundi',
    tuesday: 'mardi',
    wednesday: 'mercredi',
    thursday: 'jeudi',
    friday: 'vendredi',
    saturday: 'samedi',
    sunday: 'dimanche'
};
const t = (key, opts = {}) => {
    const dayMatch = key.match(/daysOfWeek\.(\w+)$/);
    if (dayMatch) {
        return dayNames[dayMatch[1]];
    }

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
        const properties = [{name: 'start', value: '2026-07-22T10:00:00.000'}];
        expect(getConditionLabel('jnt:startEndDateCondition', properties, t, 'de'))
            .toBe('A partir du 2026-07-22T10:00:00.000|de|long');
    });
});
