import {dateOnlyFromIsoString, fillDisabledDaysFromJCRConstraints, toDateOnlyIsoString} from './DateTimePicker.utils';

describe('DateTime picker utils', () => {
    describe('toDateOnlyIsoString / dateOnlyFromIsoString', () => {
        it('serializes a picked calendar day as UTC midnight, using its own y/m/d, not an instant conversion', () => {
            // Deliberately not January 1st or the 31st -- if this ever regressed to real
            // instant math, only a month/day boundary would reliably expose it, so cover one.
            expect(toDateOnlyIsoString(new Date(2027, 0, 15))).toBe('2027-01-15T00:00:00.000Z');
        });

        it('round-trips the exact calendar day regardless of the runtime\'s own local timezone', () => {
            // ToDateOnlyIsoString reads the Date object's LOCAL y/m/d (whatever this process's own
            // timezone happens to be) -- the fix under test is that the day survives that trip
            // unchanged, not any specific timezone's arithmetic, so no TZ pinning is needed here.
            const picked = new Date(2027, 0, 15);
            const stored = toDateOnlyIsoString(picked);
            const reread = dateOnlyFromIsoString(stored);

            expect(reread.getFullYear()).toBe(2027);
            expect(reread.getMonth()).toBe(0);
            expect(reread.getDate()).toBe(15);
        });

        it('reads the calendar day literally, ignoring any non-UTC offset already present in a stored value', () => {
            // A value anchored under the old NOT_ZONED_DATE convention (server-timezone offset
            // baked in, e.g. a Paris server writing +01:00) must still resolve to the SAME
            // calendar day it was originally saved as -- reading it via its own instant (through
            // an offset-aware Date/dayjs parse) would roll it back to the 14th; reading only the
            // leading literal digits must not.
            const legacyServerOffsetValue = '2027-01-15T00:00:00.000+01:00';
            const reread = dateOnlyFromIsoString(legacyServerOffsetValue);

            expect(reread.getFullYear()).toBe(2027);
            expect(reread.getMonth()).toBe(0);
            expect(reread.getDate()).toBe(15);
        });
    });

    describe('fillDisabledDaysFromJCRConstraints', () => {
        const before = '2019-06-01T00:00:00';
        const beforeTime = '2019-06-01T00:01:00';
        const beforeDay = '2019-06-02T00:00:00';
        const after = '2019-07-01T00:00:00';
        const afterTime = '2019-06-30T23:59:00';
        const afterDay = '2019-06-30T00:00:00';
        const field = ({incBefore, before, after, incAfter}) => {
            return {
                valueConstraints: [
                    {value: {string: incBefore + before + ',' + after + incAfter}}
                ]
            };
        };

        const tests = [{
            input: {
                incBefore: '[', before, after, incAfter: ']'
            },
            result: {
                datetime: [
                    {before: new Date(before)},
                    {after: new Date(after)}
                ],
                date: [
                    {before: new Date(before)},
                    {after: new Date(after)}
                ]
            }
        },
        {
            input: {
                incBefore: '(', before, after, incAfter: ']'
            },
            result: {
                date: [
                    {before: new Date(beforeDay)},
                    {after: new Date(after)}
                ],
                datetime: [
                    {before: new Date(beforeTime)},
                    {after: new Date(after)}
                ]
            }
        },
        {
            input: {
                incBefore: '(', before, after, incAfter: ')'
            },
            result: {
                date: [
                    {before: new Date(beforeDay)},
                    {after: new Date(afterDay)}
                ],
                datetime: [
                    {before: new Date(beforeTime)},
                    {after: new Date(afterTime)}
                ]
            }
        }];
        tests.forEach(test => {
            let testField = field(test.input);
            it('should return the disabledDays on date variant regarding the provided JCR Constraints for ' + testField.valueConstraints[0].value.string, () => {
                expect(fillDisabledDaysFromJCRConstraints(testField, false)).toEqual(test.result.date);
            });
            it('should return the disabledDays on datetime variant regarding the provided JCR Constraints for ' + testField.valueConstraints[0].value.string, () => {
                expect(fillDisabledDaysFromJCRConstraints(testField, true)).toEqual(test.result.datetime);
            });
        });
    });
});
