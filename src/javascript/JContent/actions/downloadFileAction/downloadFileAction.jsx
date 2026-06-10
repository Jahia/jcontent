import {useNodeChecks} from '@jahia/data-helper';
import PropTypes from 'prop-types';
import React, {useContext} from 'react';
import {ComponentRendererContext} from '@jahia/ui-extender';
import {DownloadFileDialog} from '~/JContent/actions/downloadFileAction/DownloadFileDialog';
import {isDefinitelyHidden} from '../utils/nodeVisibilityUtils';

export const DownloadFileActionComponent = ({path, node: prefetchedNode, render: Render, loading: Loading, ...others}) => {
    const componentRenderer = useContext(ComponentRendererContext);
    const showOnNodeTypes = ['jnt:file'];
    const skip = isDefinitelyHidden(prefetchedNode, {showOnNodeTypes});
    const res = useNodeChecks(
        {path},
        {
            skip,
            showOnNodeTypes,
            requiredSitePermission: ['downloadAction']
        }
    );

    if (res.loading) {
        return (Loading && <Loading {...others}/>) || false;
    }

    if (skip) {
        return false;
    }

    const isVisible = res.checksResult;

    const onExit = () => {
        componentRenderer.destroy('downloadFileDialog');
    };

    return (
        <Render
            {...others}
            isVisible={isVisible}
            enabled={isVisible}
            onClick={() => {
                componentRenderer.render('downloadFileDialog', DownloadFileDialog, {path, onExit});
            }}
        />
    );
};

DownloadFileActionComponent.propTypes = {
    path: PropTypes.string,

    node: PropTypes.object,

    render: PropTypes.func.isRequired,

    loading: PropTypes.func
};
