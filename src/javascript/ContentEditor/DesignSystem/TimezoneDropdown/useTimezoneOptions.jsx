import {allTimezones, useTimezoneSelect} from 'react-timezone-select';
import {timezoneGroups} from './timezoneGroups';

/**
 * Convert the list of options that useTimezoneSelect returns into a tree structure to be used in moonstone Dropdown
 */
export const useTimezoneOptions = () => {
    const {options, parseTimezone} = useTimezoneSelect({
        timezones: {...allTimezones, ...timezoneGroups},
        labelStyle: 'original'
    });

    options.forEach(opt => {
        opt.id = opt.value;
    }); // Add id attr as required by moonstone Dropdown
    // Map of timezone options grouped by offset, and also parent timezones (i.e. timezones that start with 'Etc/GMT')
    // i.e. { "root": [list of parent timezones], ...[offset]: [list of timezones with given offset]}
    const timezoneMap = Map.groupBy(options, tz => tz.value.startsWith('Etc/GMT') ? 'root' : tz.offset);
    const treeData = timezoneMap.get('root');
    treeData.forEach(parentTz => {
        parentTz.children = timezoneMap.get(parentTz.offset);
        timezoneMap.delete(parentTz.offset);
    });
    timezoneMap.delete('root');
    // Collect any remaining timezones as ungrouped
    timezoneMap.forEach(tzList => treeData.push(...tzList));

    return {treeData, options, parseTimezone};
};
