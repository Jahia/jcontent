import React, {useContext} from 'react';
import {RenameDialog} from './RenameDialog';
import {useNodeChecks} from '@jahia/data-helper';
import {ComponentRendererContext} from '@jahia/ui-extender';
import PropTypes from 'prop-types';
import {PATH_FILES_ITSELF} from '../actions.constants';
import {isDefinitelyHidden} from '../utils/nodeVisibilityUtils';

export const RenameActionComponent = ({path, node: prefetchedNode, render: Render, loading: Loading, ...others}) => {
    const componentRenderer = useContext(ComponentRendererContext);
    const skip = isDefinitelyHidden(prefetchedNode, {showOnNodeTypes: ['jnt:folder', 'jnt:file']});
    const res = useNodeChecks(
        {path},
        {
            skip,
            requiredPermission: ['jcr:write'],
            showOnNodeTypes: ['jnt:folder', 'jnt:file'],
            hideForPaths: [PATH_FILES_ITSELF]
        }
    );

    if (res.loading) {
        return (Loading && <Loading {...others}/>) || false;
    }

    if (skip) {
        return false;
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
    node: PropTypes.object,
    render: PropTypes.func.isRequired,
    loading: PropTypes.func
};
