import React, {useContext} from 'react';
import {RenameDialog} from './RenameDialog';
import {useNodeChecks} from '@jahia/data-helper';
import {ComponentRendererContext} from '@jahia/ui-extender';
import PropTypes from 'prop-types';

export const RenameActionComponent = ({path, render: Render, loading: Loading, ...others}) => {
    const componentRenderer = useContext(ComponentRendererContext);
    const res = useNodeChecks(
        {path},
        {
            requiredPermission: ['jcr:write'],
            showOnNodeTypes: ['jnt:folder', 'jnt:file']
        }
    );

    if (res.loading) {
        return (Loading && <Loading {...others}/>) || false;
    }

    const onExit = () => {
        componentRenderer.destroy('renameDialog');
    };

    return (
        <Render
            {...others}
            isVisible={res.checksResult}
            onClick={() => {
                componentRenderer.render('renameDialog', RenameDialog, {path, onExit});
            }}
        />
    );
};

RenameActionComponent.propTypes = {
    path: PropTypes.string,
    render: PropTypes.func.isRequired,
    loading: PropTypes.func
};
