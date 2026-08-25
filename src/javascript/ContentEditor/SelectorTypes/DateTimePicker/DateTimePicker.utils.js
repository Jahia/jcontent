import {dayjs} from 'date-formatter';
import {extractRangeConstraints} from '~/ContentEditor/utils';

const _buildDisableDay = ({type, boundary, disableBoundary, datetime, offset}) => {
    if (boundary && boundary.length > 0) {
        const disabledDays = {};
        disabledDays[type] = new Date(boundary);
        if (disableBoundary) {
            if (datetime) {
                // Add offset minute
                disabledDays[type] = dayjs(disabledDays[type]).add(offset, 'minute').toDate();
            } else {
                // Add offset day
                disabledDays[type] = dayjs(disabledDays[type]).add(offset, 'day').toDate();
            }
        }

        return disabledDays;
    }

    return undefined;
};

// A DatePicker (date-only) field has no time-of-day, so it has no legitimate "instant" to be
// converted through the way DateTimePicker's local <-> UTC round trip works -- doing so would
// make the stored calendar day depend on whichever timezone happened to write or read it (e.g.
// local midnight in a positive-UTC-offset zone rolls back to the previous day once converted to
// UTC). These two keep the calendar day the single source of truth, immune to any timezone by
// construction: written using the LOCAL y/m/d the picker itself operates in -- never the Date
// object's real instant -- and read back using only the leading YYYY-MM-DD literal of whatever
// was stored -- never re-interpreting its offset. Both directions bypass Date-instant math
// entirely, which is also why they're immune to how the value was originally anchored (old
// server-timezone NOT_ZONED_DATE data included): that literal date substring is exactly the
// calendar day that was originally picked, regardless of what timezone wrote it.
export function toDateOnlyIsoString(date) {
    const pad = n => (n < 10 ? '0' : '') + n;
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T00:00:00.000Z`;
}

export function dateOnlyFromIsoString(value) {
    const [year, month, day] = value.slice(0, 10).split('-').map(Number);
    return new Date(year, month - 1, day);
}

export function fillDisabledDaysFromJCRConstraints(field, datetime) {
    if (field.valueConstraints && field.valueConstraints.length > 0) {
        const disableDays = [];
        const {lowerBoundary, disableLowerBoundary, upperBoundary, disableUpperBoundary} = extractRangeConstraints(field.valueConstraints[0].value.string);
        // Add one day / minute to the disabled dates if the lower boundary is not include, ex : "(2019-06-01,.."
        const lowerDisabledDays = _buildDisableDay({type: 'before', boundary: lowerBoundary, disableBoundary: disableLowerBoundary, datetime, offset: 1});
        if (lowerDisabledDays) {
            disableDays.push(lowerDisabledDays);
        }

        // Remove one day / minute to the disabled dates if the upper boundary is not include, ex : "..,2019-06-01)"
        const upperDisabledDays = _buildDisableDay({type: 'after', boundary: upperBoundary, disableBoundary: disableUpperBoundary, datetime, offset: -1});
        if (upperDisabledDays) {
            disableDays.push(upperDisabledDays);
        }

        return disableDays;
    }

    return undefined;
}
