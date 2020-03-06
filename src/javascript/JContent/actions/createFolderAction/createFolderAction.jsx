import React, {useContext} from 'react';
import CreateFolderDialog from './CreateFolderDialog';
import {useNodeChecks} from '@jahia/data-helper';
import {ComponentRendererContext} from '@jahia/ui-extender';
import PropTypes from 'prop-types';

export const CreateFolderAction = ({context, render: Render, loading: Loading}) => {
    const componentRenderer = useContext(ComponentRendererContext);
    const res = useNodeChecks(
        {path: context.path},
        {requiredPermission: ['jcr:addChildNodes'], ...context}
    );

    if (res.loading && Loading) {
        return <Loading context={context}/>;
    }

    const onExit = () => {
        componentRenderer.destroy('createFolderDialog');
    };

    return (
        <Render context={{
            ...context,
            isVisible: res.checksResult,
            enabled: res.checksResult,
            onClick: () => {
                componentRenderer.render('createFolderDialog', Dialog, {path: context.path, contentType: context.contentType, onExit: onExit});
            }
        }}/>
    );
};

const Dialog = ({path, contentType, onExit}) => {
    return <CreateFolderDialog path={path} contentType={contentType} onExit={onExit}/>;
};

Dialog.propTypes = {
    path: PropTypes.string.isRequired,
    contentType: PropTypes.string.isRequired,
    onExit: PropTypes.func.isRequired
};

CreateFolderAction.propTypes = {
    context: PropTypes.object.isRequired,
    render: PropTypes.func.isRequired,
    loading: PropTypes.func
};

const createFolderAction = {
    component: CreateFolderAction
};

export default createFolderAction;
