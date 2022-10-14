import {useNodeChecks} from '@jahia/data-helper';
import PropTypes from 'prop-types';
import React, {useContext} from 'react';
import {ComponentRendererContext} from '@jahia/ui-extender';
import {DownloadFileDialog} from '~/JContent/actions/downloadFileAction/DownloadFileDialog';

export const DownloadFileActionComponent = ({path, render: Render, loading: Loading, ...others}) => {
    const componentRenderer = useContext(ComponentRendererContext);
    const res = useNodeChecks(
        {path},
        {
            showOnNodeTypes: ['jnt:file'],
            requiredSitePermission: ['downloadAction']
        }
    );

    if (res.loading) {
        return (Loading && <Loading {...others}/>) || false;
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

    render: PropTypes.func.isRequired,

    loading: PropTypes.func
};
