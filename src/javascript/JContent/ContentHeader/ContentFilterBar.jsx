import React from 'react';
import PropTypes from 'prop-types';
import {shallowEqual, useSelector} from 'react-redux';
import {registry} from '@jahia/ui-extender';
import {FilterBar} from '~/JContent/filters/FilterBar/FilterBar';
import {useFilters} from '~/JContent/filters/useFilters';
import {useViewFilters} from '~/JContent/filters/useViewFilters';

/**
 * The filter bar of the current jContent list, for `toolbarRight` of its header.
 * It shows when the accordion sets `tableConfig.filters` and its query handler applies the filters.
 */
export const ContentFilterBar = ({isCollapsed}) => {
    const options = useSelector(state => ({
        mode: state.jcontent.mode,
        siteKey: state.site,
        path: state.jcontent.path,
        searchContentType: state.jcontent.params.searchContentType,
        filters: state.jcontent.params.filters,
        tableView: state.jcontent.tableView
    }), shallowEqual);
    const tableConfig = registry.get('accordionItem', options.mode)?.tableConfig;
    const {isEnabled, fields} = useViewFilters(options, tableConfig);
    const {filters, setFilters} = useFilters();

    if (!isEnabled || fields.length === 0) {
        return null;
    }

    return (
        <FilterBar
            fields={fields}
            filters={filters}
            defaultFields={tableConfig.filters.defaultFields || []}
            isCollapsed={isCollapsed}
            data-sel-role="content-filter-bar"
            onChange={setFilters}
        />
    );
};

ContentFilterBar.propTypes = {
    isCollapsed: PropTypes.bool
};
