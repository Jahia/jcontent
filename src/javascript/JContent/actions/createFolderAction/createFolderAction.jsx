import React, {useContext} from 'react';
import CreateFolderDialog from './CreateFolderDialog';
import {useNodeChecks} from '@jahia/data-helper';
import {ComponentRendererContext} from '@jahia/ui-extender';
import PropTypes from 'prop-types';

export const CreateFolderActionComponent = ({path, createFolderType, render: Render, loading: Loading, ...others}) => {
    const componentRenderer = useContext(ComponentRendererContext);
    const res = useNodeChecks(
        {path},
        {
            requiredPermission: ['jcr:addChildNodes'],
            showOnNodeTypes: [createFolderType]
        }
    );

    if (res.loading) {
        return (Loading && <Loading {...others}/>) || false;
    }

    const onExit = () => {
        componentRenderer.destroy('createFolderDialog');
    };

    return (
        <Render
            {...others}
            isVisible={res.checksResult}
            onClick={() => {
                componentRenderer.render('createFolderDialog', CreateFolderDialog, {path, contentType: createFolderType, onExit});
            }}
        />
    );
};

CreateFolderActionComponent.propTypes = {
    path: PropTypes.string,
    createFolderType: PropTypes.string.isRequired,
    render: PropTypes.func.isRequired,
    loading: PropTypes.func
};
