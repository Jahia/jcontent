import React, {useContext} from 'react';
import PropTypes from 'prop-types';
import {useNodeChecks} from '@jahia/data-helper';
import {ComponentRendererContext} from '@jahia/ui-extender';
import {isDefinitelyHidden} from '../utils/nodeVisibilityUtils';
import FocalPointDialog from './FocalPointDialog';

export const SetFocalPointActionComponent = ({path, node: prefetchedNode, render: Render, loading: Loading, ...others}) => {
    const componentRenderer = useContext(ComponentRendererContext);
    // jmix:image rather than jmix:focalPoint: the mixin reaches every image through "extends", so
    // gating on it would say nothing, and the action has to be offered before a point exists.
    const showOnNodeTypes = ['jmix:image'];
    const skip = isDefinitelyHidden(prefetchedNode, {showOnNodeTypes});
    const res = useNodeChecks({path}, {skip, showOnNodeTypes, requiredPermission: ['jcr:write']});

    if (res.loading) {
        return (Loading && <Loading {...others}/>) || false;
    }

    if (skip) {
        return false;
    }

    const onExit = () => {
        componentRenderer.destroy('focalPointDialog');
    };

    return (
        <Render
            {...others}
            isVisible={res.checksResult}
            onClick={() => {
                componentRenderer.render('focalPointDialog', FocalPointDialog, {path, onExit});
            }}
        />
    );
};

SetFocalPointActionComponent.propTypes = {
    path: PropTypes.string,
    node: PropTypes.object,
    render: PropTypes.func.isRequired,
    loading: PropTypes.func
};
