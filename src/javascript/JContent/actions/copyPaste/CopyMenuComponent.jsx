import React from 'react';
import {useNodeChecks} from '@jahia/data-helper';
import {MenuActionComponent} from '@jahia/ui-extender';
import PropTypes from 'prop-types';
import {ACTION_PERMISSIONS} from '~/JContent/actions/actions.constants';
import {hasMixin, JahiaRenderedModulesUtil} from '~/JContent/JContent.utils';
import {useSelector} from 'react-redux';
import {isDefinitelyHidden} from '~/JContent/actions/utils/nodeVisibilityUtils';

export const CopyMenuComponent = ({path, paths, node: prefetchedNode, render: Render, loading: Loading, ...others}) => {
    const language = useSelector(state => state.language);

    const skip = !paths && (
        JahiaRenderedModulesUtil.isJahiaArea(path) ||
        isDefinitelyHidden(prefetchedNode, {hideMixins: ['jmix:markedForDeletionRoot']})
    );

    const res = useNodeChecks({path, paths, language}, {
        skip,
        getPrimaryNodeType: true,
        getDisplayName: true,
        requiredPermission: ['jcr:read'],
        requiredSitePermission: [ACTION_PERMISSIONS.copyPageAction],
        ...others
    });

    if (res.error) {
        console.error(`Error while fetching checks for node ${path || paths}:`, res.error);
        return null;
    }

    if (res.loading) {
        return (Loading && <Loading {...others}/>) || false;
    }

    if (skip) {
        return <Render {...others} isVisible={false}/>;
    }

    const isVisible = res.checksResult && !JahiaRenderedModulesUtil.isJahiaArea(path) &&
        (res.node ?
            !hasMixin(res.node, 'jmix:markedForDeletionRoot') :
            res.nodes?.reduce((acc, node) => acc && !hasMixin(node, 'jmix:markedForDeletionRoot'), true)
        );

    if (!isVisible) {
        return <Render {...others} isVisible={isVisible}/>;
    }

    return <MenuActionComponent render={Render} loading={Loading} {...others}/>;
};

CopyMenuComponent.propTypes = {
    path: PropTypes.string,
    paths: PropTypes.arrayOf(PropTypes.string),
    node: PropTypes.object,
    render: PropTypes.func.isRequired,
    loading: PropTypes.func
};
