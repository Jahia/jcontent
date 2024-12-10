import React from 'react';
import {registry} from '@jahia/ui-extender';
import * as PropTypes from 'prop-types';

export const PageHeaderContainer = ({setCurrentUrlParams, setLoading}) => {
    const headers = registry.find({type: 'pageHeader'});

    if (!headers || !headers.length) {
        return null;
    }

    return (
        <div data-sel-role="page-header-list">
            {
                headers.map(header => {
                    const Component = header.Component;
                    return <Component key={header.key} setCurrentUrlParams={setCurrentUrlParams} setLoading={setLoading}/>;
                })
            }
        </div>
    );
};

PageHeaderContainer.propTypes = {
    setCurrentUrlParams: PropTypes.func,
    setLoading: PropTypes.func
};
