import {useMemo} from 'react';
import {useFilterFields} from './useFilterFields';
import {readFilters} from './filterParams';
import {filtersToNodeConstraint} from './filterConstraint';

/**
 * The fields of a view: the field list, kept to the keys of `tableConfig.filters.fields` when the accordion gives them.
 * `fields` is a list of keys, or a function that gets the options of the view and returns them.
 */
export const restrictFields = (fields, config, options) => {
    const keys = typeof config?.fields === 'function' ? config.fields(options) : config?.fields;
    return Array.isArray(keys) ? fields.filter(field => keys.includes(field.key)) : fields;
};

/** Whether a view shows filters: its accordion sets `tableConfig.filters`, and its query handler applies them. */
export const isFilterable = (tableConfig, options) => Boolean(tableConfig?.filters) &&
    Boolean(tableConfig?.queryHandler?.supportsFilters?.(options));

/**
 * The filters of a view, checked against its field list, and their node constraint.
 * The search results with `searchContentType` also offer the properties of this type.
 *
 * @param {object} options the options of the view, with `filters` from the URL params
 * @param {object} tableConfig the table config of the accordion
 * @returns {{isEnabled: boolean, fields: Array, filters: Array, nodeConstraint: object, isLoading: boolean}}
 */
export const useViewFilters = (options, tableConfig) => {
    const isEnabled = isFilterable(tableConfig, options);
    const config = tableConfig?.filters;
    const {fields: allFields, loading} = useFilterFields({
        nodeType: isEnabled ? options.searchContentType : undefined,
        siteKey: options.siteKey,
        skip: !isEnabled
    });

    const fields = useMemo(() => (isEnabled ? restrictFields(allFields, config, options) : []),
        // The options object changes on each render, the keys only depend on these values
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [isEnabled, allFields, config, options.mode, options.path, options.searchContentType]);
    const rawFilters = options.filters;
    const filters = useMemo(() => (isEnabled ? readFilters({filters: rawFilters}) : []), [isEnabled, rawFilters]);
    const nodeConstraint = useMemo(() => filtersToNodeConstraint(filters, fields), [filters, fields]);

    // A filter on a property of the type waits for the field list, or the first query would ignore it
    const isLoading = isEnabled && loading && filters.some(filter => filter.field.startsWith('prop:'));

    return {isEnabled, fields, filters, nodeConstraint, isLoading};
};
