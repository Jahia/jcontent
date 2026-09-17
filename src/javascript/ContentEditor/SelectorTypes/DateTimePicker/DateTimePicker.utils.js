import {dayjs} from 'date-formatter';
import {extractRangeConstraints} from '~/ContentEditor/utils';

// One JCR range boundary as an inclusive calendar day; an exclusive bound is nudged inwards by a minute / a day first
const _toBound = ({boundary, exclusive, datetime, offset}) => {
    if (!boundary || boundary.length === 0) {
        return undefined;
    }

    if (datetime) {
        const instant = dayjs(new Date(boundary));
        return (exclusive ? instant.add(offset, 'minute') : instant).format('YYYY-MM-DD');
    }

    const day = dayjs(boundary.slice(0, 10));
    return (exclusive ? day.add(offset, 'day') : day).format('YYYY-MM-DD');
};

// A date-only field stores the picked calendar day literally, never as an instant: converting local
// midnight to UTC would shift the day for anyone in a positive-UTC-offset timezone. Writing uses the
// local Y/M/D of the picked Date, reading only looks at the leading YYYY-MM-DD of the stored value, so
// the day survives whichever timezone wrote it (old server-timezone NOT_ZONED_DATE data included).
export const toDateOnlyIsoString = date => dayjs(date).format('YYYY-MM-DD') + 'T00:00:00.000Z';

// Dayjs reads a bare 'YYYY-MM-DD' as local midnight (a native Date would read it as UTC)
export const dateOnlyFromIsoString = value => dayjs(value.slice(0, 10)).toDate();

// Calendar-day bounds for the picker; the time of day of a constraint is still enforced by dateFieldValidation on save
export function pickerBoundsFromJCRConstraints(field, datetime) {
    if (!field.valueConstraints || field.valueConstraints.length === 0) {
        return {};
    }

    const {lowerBoundary, disableLowerBoundary, upperBoundary, disableUpperBoundary} = extractRangeConstraints(field.valueConstraints[0].value.string);
    const lower = _toBound({boundary: lowerBoundary, exclusive: disableLowerBoundary, datetime, offset: 1});
    const upper = _toBound({boundary: upperBoundary, exclusive: disableUpperBoundary, datetime, offset: -1});

    return {minDate: lower, maxDate: upper};
}
