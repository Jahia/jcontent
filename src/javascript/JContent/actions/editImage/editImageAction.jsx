import React, {useContext} from 'react';
import {useNodeChecks} from '@jahia/data-helper';
import {ComponentRendererContext} from '@jahia/ui-extender';
import PropTypes from 'prop-types';
import {ACTION_PERMISSIONS} from '../actions.constants';
import {isDefinitelyHidden} from '../utils/nodeVisibilityUtils';
import ImageEditorDialog from '~/JContent/actions/editImage/ImageEditorDialog';

export const EditImageActionComponent = ({path, node: prefetchedNode, render: Render, loading: Loading, ...others}) => {
    const componentRenderer = useContext(ComponentRendererContext);
    const skip = isDefinitelyHidden(prefetchedNode, {showOnNodeTypes: ['jmix:image']});
    const res = useNodeChecks(
        {path},
        {
            skip,
            showOnNodeTypes: ['jmix:image'],
            requiredPermission: ['jcr:write'],
            requiredSitePermission: [ACTION_PERMISSIONS.openImageEditorAction]
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
            isVisible={res.checksResult}
            onClick={() => {
                componentRenderer.render('createFolderDialog', ImageEditorDialog, {path, onExit});
            }}
        />
    );
};

EditImageActionComponent.propTypes = {
    path: PropTypes.string,
    node: PropTypes.object,
    render: PropTypes.func.isRequired,
    loading: PropTypes.func
};
