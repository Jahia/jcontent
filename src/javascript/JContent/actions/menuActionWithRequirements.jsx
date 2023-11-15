import React from 'react';
import {useNodeChecks} from '@jahia/data-helper';
import {MenuActionComponent} from '@jahia/ui-extender';
import PropTypes from 'prop-types';

export const MenuActionWithRequirementsComponent = ({path, render: Render, loading: Loading, ...others}) => {
    const res = useNodeChecks({path}, others);

    if (res.loading) {
        return (Loading && <Loading {...others}/>) || false;
    }

    const isVisible = res.checksResult;

    if (!isVisible) {
        return <Render {...others} isVisible={isVisible}/>;
    }

    return <MenuActionComponent render={Render} loading={Loading} {...others}/>;
};

MenuActionWithRequirementsComponent.propTypes = {
    path: PropTypes.string.isRequired,
    render: PropTypes.func.isRequired,
    loading: PropTypes.func
};
