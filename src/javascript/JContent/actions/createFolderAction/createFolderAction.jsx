import React, {useContext} from 'react';
import CreateFolderDialog from './CreateFolderDialog';
import {useNodeChecks} from '@jahia/data-helper';
import {ComponentRendererContext} from '@jahia/ui-extender';
import PropTypes from 'prop-types';

export const CreateFolderActionComponent = ({context, render: Render, loading: Loading}) => {
    const componentRenderer = useContext(ComponentRendererContext);
    const res = useNodeChecks(
        {path: context.path},
        {requiredPermission: ['jcr:addChildNodes'], ...context}
    );

    if (res.loading) {
        return (Loading && <Loading context={context}/>) || false;
    }

    const onExit = () => {
        componentRenderer.destroy('createFolderDialog');
    };

    return (
        <Render context={{
            ...context,
            isVisible: res.checksResult,
            onClick: () => {
                componentRenderer.render('createFolderDialog', CreateFolderDialog, {path: context.path, contentType: context.contentType, onExit: onExit});
            }
        }}/>
    );
};

CreateFolderActionComponent.propTypes = {
    context: PropTypes.object.isRequired,
    render: PropTypes.func.isRequired,
    loading: PropTypes.func
};
