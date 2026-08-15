export interface WallClock {
    timezoneId: string;
    year: number;
    month: number;
    day: number;
    hour: number;
    minute: number;
}

// The offset (ms) `timezoneId` sits from UTC at `date`, DST-aware. Formats `date` as a wall
// clock string in both `timezoneId` and UTC, then re-parses each string with the bare `Date`
// constructor (always interprets a no-offset string as the CURRENT RUNTIME's own local time) --
// the runtime's own zone cancels out in the subtraction, so this works regardless of what
// timezone this test-runner process happens to be in. Deliberately uses only
// `Date#toLocaleString` (widely available under any TS `lib` target) rather than
// `Intl.DateTimeFormat#formatToParts`/`hourCycle`, which this repo's tsconfig doesn't have
// type declarations for.
const getTimezoneOffsetMs = (date: Date, timezoneId: string): number => {
    const zoned = new Date(date.toLocaleString('en-US', {timeZone: timezoneId}));
    const utc = new Date(date.toLocaleString('en-US', {timeZone: 'UTC'}));
    return zoned.getTime() - utc.getTime();
};

// Computes the UTC instant a given wall clock represents WHEN OBSERVED IN `timezoneId` --
// entirely independent of whatever timezone this test-runner's own Node process happens to be
// in (which is not necessarily the browser's overridden timezone, set via
// cy.setBrowserTimezone). Guess-then-correct: treat the wall clock as if it were already UTC,
// measure how far that guess actually sits from `timezoneId`'s local time at that instant, then
// correct by that offset.
//
// Verified against `new Date('...+09:00')` / `new Date('...-05:00')`-style explicit-offset
// construction before use:
//   localWallClockToUtcIso({timezoneId: 'Asia/Tokyo', year: 2027, month: 1, day: 15, hour: 9, minute: 0})
//     === '2027-01-15T00:00:00.000Z'
//   localWallClockToUtcIso({timezoneId: 'America/Toronto', year: 2027, month: 1, day: 15, hour: 23, minute: 30})
//     === '2027-01-16T04:30:00.000Z'
export const localWallClockToUtcIso = ({timezoneId, year, month, day, hour, minute}: WallClock): string => {
    const guess = new Date(Date.UTC(year, month - 1, day, hour, minute));
    const offsetMs = getTimezoneOffsetMs(guess, timezoneId);
    return new Date(guess.getTime() - offsetMs).toISOString();
};

// Same wall-clock fields as `date`, offset by `days` -- used to build a visibility window that
// comfortably spans (or excludes) "now" without depending on exact run time.
export const daysFrom = (days: number, date: Date = new Date()): Date => {
    const shifted = new Date(date.getTime());
    shifted.setDate(shifted.getDate() + days);
    return shifted;
};

// The inverse of localWallClockToUtcIso: what a UTC instant displays as (MM/DD/YYYY HH:mm) WHEN
// OBSERVED IN `timezoneId` -- e.g. for asserting a DateTimePicker's displayed value against a
// stored UTC value under whatever timezone the browser under test currently has, without
// hardcoding that timezone's offset arithmetic into the expectation. Same guess-then-correct
// technique as getTimezoneOffsetMs, just added instead of subtracted, and read back with UTC
// getters (not local ones) so this is independent of the test-runner process's own timezone too.
export const utcIsoToWallClockDisplay = (utcIso: string, timezoneId: string): string => {
    const instant = new Date(utcIso);
    const offsetMs = getTimezoneOffsetMs(instant, timezoneId);
    const shifted = new Date(instant.getTime() + offsetMs);
    const pad = (n: number) => (n < 10 ? '0' + n : String(n));
    return `${pad(shifted.getUTCMonth() + 1)}/${pad(shifted.getUTCDate())}/${shifted.getUTCFullYear()} ${pad(shifted.getUTCHours())}:${pad(shifted.getUTCMinutes())}`;
};
