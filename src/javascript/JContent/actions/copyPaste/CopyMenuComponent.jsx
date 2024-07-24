import React from 'react';
import {useNodeChecks} from '@jahia/data-helper';
import {MenuActionComponent} from '@jahia/ui-extender';
import PropTypes from 'prop-types';
import {ACTION_PERMISSIONS} from '~/JContent/actions/actions.constants';

export const CopyMenuComponent = ({path, render: Render, loading: Loading, ...others}) => {
    const res = useNodeChecks({path}, {
        getPrimaryNodeType: true,
        getDisplayName: true,
        requiredPermission: ['jcr:read'],
        requiredSitePermission: [ACTION_PERMISSIONS.copyPageAction],
        ...others
    });

    if (res.loading) {
        return (Loading && <Loading {...others}/>) || false;
    }

    const isVisible = res.checksResult;

    if (!isVisible) {
        return <Render {...others} isVisible={isVisible}/>;
    }

    return <MenuActionComponent render={Render} loading={Loading} {...others}/>;
};

CopyMenuComponent.propTypes = {
    path: PropTypes.string.isRequired,
    render: PropTypes.func.isRequired,
    loading: PropTypes.func
};
