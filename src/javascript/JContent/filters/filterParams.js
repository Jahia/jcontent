const isText = value => typeof value === 'string';

/**
 * One filter as it goes in the URL, or null when it is not a filter.
 * rison refuses an `undefined` value, so a filter with no value has no `value` key.
 */
export const cleanFilter = filter => {
    if (!filter || typeof filter !== 'object' || !isText(filter.field) || !isText(filter.operator) || filter.field === '' || filter.operator === '') {
        return null;
    }

    const {field, operator, value} = filter;
    if (Array.isArray(value)) {
        const values = value.filter(isText);
        return values.length > 0 ? {field, operator, value: values} : {field, operator};
    }

    return isText(value) && value !== '' ? {field, operator, value} : {field, operator};
};

/** The filters of the jContent params. A parameter that is not a list gives no filter. */
export const readFilters = params => {
    const filters = params?.filters;
    if (!Array.isArray(filters)) {
        return [];
    }

    return filters.map(cleanFilter).filter(Boolean);
};

/** The params with these filters. An empty list removes the key. */
export const withFilters = (params, filters) => {
    const {filters: previous, ...rest} = params || {};
    const cleaned = (filters || []).map(cleanFilter).filter(Boolean);
    return cleaned.length > 0 ? {...rest, filters: cleaned} : rest;
};

/** The filters with one filter set: it replaces the filter of the same field, or comes last. */
export const setFilterIn = (filters, filter) => {
    const index = filters.findIndex(candidate => candidate.field === filter.field);
    if (index < 0) {
        return [...filters, filter];
    }

    return filters.map((candidate, candidateIndex) => (candidateIndex === index ? filter : candidate));
};
