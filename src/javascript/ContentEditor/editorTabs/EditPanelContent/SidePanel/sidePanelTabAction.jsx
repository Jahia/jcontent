import React, {useCallback, useEffect} from 'react';
import PropTypes from 'prop-types';
import {useNodeChecks} from '@jahia/data-helper';
import {useSidePanelContext} from './SidePanelContext';

export const SidePanelTab = ({setActiveTab, onVisible, isDisplayable, value, render: Render, loading: Loading, ...otherProps}) => {
    const ctx = useSidePanelContext();

    const skipped = !ctx.path || otherProps.skip;
    const res = useNodeChecks(
        {path: ctx.path},
        {...otherProps, skip: skipped}
    );

    const isVisible = !res.loading && (skipped || res.checksResult) && isDisplayable({...otherProps, ...ctx});

    const handleClick = useCallback(() => {
        setActiveTab(value);
    }, [setActiveTab, value]);

    useEffect(() => {
        if (isVisible && onVisible) {
            onVisible(value);
        }
    }, [isVisible, onVisible, value]);

    if (res.loading) {
        return (Loading && <Loading {...otherProps}/>) || false;
    }

    return (
        <>
            {isVisible &&
            <Render
                {...otherProps}
                onClick={handleClick}
            />}
        </>
    );
};

SidePanelTab.propTypes = {
    render: PropTypes.func.isRequired,
    activeTab: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,
    setActiveTab: PropTypes.func.isRequired,
    onVisible: PropTypes.func,
    isDisplayable: PropTypes.func.isRequired,
    loading: PropTypes.func
};

export const sidePanelTabAction = {
    component: SidePanelTab
};
