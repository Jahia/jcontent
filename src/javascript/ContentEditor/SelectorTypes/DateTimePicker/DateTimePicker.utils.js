import dayjs from 'dayjs';
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
