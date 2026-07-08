import React, {useContext} from 'react';
import {useNodeChecks} from '@jahia/data-helper';
import {ComponentRendererContext} from '@jahia/ui-extender';
import PropTypes from 'prop-types';
import {ACTION_PERMISSIONS} from '../actions.constants';
import {isDefinitelyHidden} from '../utils/nodeVisibilityUtils';
import FilerobotEditor from '~/JContent/actions/editImage/FilerobotEditor';

// SVG editing would rasterize the vector source; animated GIFs would be flattened
// to a single frame. The editor works on a canvas re-encode, so both are excluded.
const EXCLUDED_MIMETYPES = ['image/svg+xml', 'image/gif'];

const RENDERER_KEY = 'imageEditorDialog';

export const EditImageActionComponent = ({path, node: prefetchedNode, render: Render, loading: Loading, ...others}) => {
    const componentRenderer = useContext(ComponentRendererContext);
    const showOnNodeTypes = ['jmix:image'];
    const skip = isDefinitelyHidden(prefetchedNode, {showOnNodeTypes});
    const res = useNodeChecks(
        {path},
        {
            skip,
            showOnNodeTypes,
            requiredPermission: ['jcr:write'],
            requiredSitePermission: [ACTION_PERMISSIONS.openImageEditorAction],
            getMimeType: true
        }
    );

    if (res.loading) {
        return (Loading && <Loading {...others}/>) || false;
    }

    if (skip) {
        return false;
    }

    const mimeType = res.node?.mimeType;
    const isVisible = Boolean(res.checksResult) &&
        Boolean(mimeType) &&
        !EXCLUDED_MIMETYPES.includes(mimeType);

    const onExit = () => {
        componentRenderer.destroy(RENDERER_KEY);
    };

    return (
        <Render
            {...others}
            isVisible={isVisible}
            enabled={isVisible}
            onClick={() => {
                componentRenderer.render(RENDERER_KEY, FilerobotEditor, {path, mimeType, onExit});
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
