import React from 'react';
import PropTypes from 'prop-types';
import {useNodeChecks} from '@jahia/data-helper';
import {useContentEditorContext} from '~/ContentEditor/contexts/ContentEditor';

export const SidePanelTab = ({setActiveTab, isDisplayable, value, isDevModeOnly, render: Render, loading: Loading, ...otherProps}) => {
    const {path} = useContentEditorContext();
    const ceCtx = useContentEditorContext();

    const res = useNodeChecks(
        {path: path},
        {...otherProps}
    );

    // Check if dev mode is required and if we're in dev mode
    const isDevMode = window.contextJsParameters?.config?.dxVersion?.includes('SNAPSHOT') || false;

    if (isDevModeOnly && !isDevMode) {
        return null;
    }

    if (res.loading) {
        /* eslint-disable react/jsx-no-useless-fragment */
        return (Loading && <Loading {...otherProps}/>) || <></>;
    }

    return (
        <>
            {isDisplayable({...otherProps, ...ceCtx}) && res.checksResult &&
            <Render
                {...otherProps}
                onClick={() => {
                    setActiveTab(value);
                }}
            />}
        </>
    );
};

SidePanelTab.propTypes = {
    render: PropTypes.func.isRequired,
    activeTab: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,
    setActiveTab: PropTypes.func.isRequired,
    isDisplayable: PropTypes.func.isRequired,
    isDevModeOnly: PropTypes.bool,
    loading: PropTypes.func
};

export const sidePanelTabAction = {
    component: SidePanelTab
};
