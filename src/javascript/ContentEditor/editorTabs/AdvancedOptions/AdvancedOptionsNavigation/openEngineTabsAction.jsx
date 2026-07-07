import React from 'react';
import PropTypes from 'prop-types';
import {useOpenEngineTabsWithConfirmation} from './useOpenEngineTabsWithConfirmation';

export const OpenEngineTabs = ({tabs, render: Render, ...otherProps}) => {
    const {openTabs, confirmationDialog} = useOpenEngineTabsWithConfirmation(tabs);

    return (
        <>
            {confirmationDialog}
            <Render {...otherProps} onClick={openTabs}/>
        </>
    );
};

OpenEngineTabs.propTypes = {
    render: PropTypes.func.isRequired,
    tabs: PropTypes.array.isRequired
};

export const openEngineTabsAction = {
    component: OpenEngineTabs
};
