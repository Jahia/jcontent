import React, {useContext} from 'react';
import {CreateFolderDialog} from './CreateFolderDialog';
import {useNodeChecks} from '@jahia/data-helper';
import {ComponentRendererContext} from '@jahia/ui-extender';
import PropTypes from 'prop-types';
import {ACTION_PERMISSIONS} from '../actions.constants';
import {isDefinitelyHidden} from '../utils/nodeVisibilityUtils';

const constraintsByType = {
    contentFolder: {
        requiredPermission: ['jcr:addChildNodes'],
        requiredSitePermission: [ACTION_PERMISSIONS.newContentFolderAction],
        showOnNodeTypes: ['jnt:contentFolder']
    },
    folder: {
        requiredPermission: ['jcr:addChildNodes'],
        requiredSitePermission: [ACTION_PERMISSIONS.newMediaFolderAction],
        showOnNodeTypes: ['jnt:folder']
    }
};

const nodeType = {
    contentFolder: 'jnt:contentFolder',
    folder: 'jnt:folder'
};

export const CreateFolderActionComponent = ({path, node: prefetchedNode, createFolderType, render: Render, loading: Loading, ...others}) => {
    const componentRenderer = useContext(ComponentRendererContext);
    const constraints = constraintsByType[createFolderType || 'contentFolder'];
    const skip = isDefinitelyHidden(prefetchedNode, {showOnNodeTypes: constraints.showOnNodeTypes});
    const res = useNodeChecks(
        {path},
        {
            skip,
            ...constraints,
            getLockInfo: true
        }
    );

    if (res.loading) {
        return (Loading && <Loading {...others}/>) || false;
    }

    if (skip) {
        return false;
    }

    const onExit = () => {
        componentRenderer.destroy('createFolderDialog');
    };

    return (
        <Render
            {...others}
            enabled={!res.node?.lockOwner}
            isVisible={res.checksResult}
            onClick={() => {
                componentRenderer.render('createFolderDialog', CreateFolderDialog, {path, contentType: nodeType[createFolderType || 'contentFolder'], onExit});
            }}
        />
    );
};

CreateFolderActionComponent.propTypes = {
    path: PropTypes.string,
    node: PropTypes.object,
    createFolderType: PropTypes.string.isRequired,
    render: PropTypes.func.isRequired,
    loading: PropTypes.func
};
