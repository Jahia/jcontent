import React, {useContext} from 'react';
import {useNodeChecks} from '@jahia/data-helper';
import {ComponentRendererContext} from '@jahia/ui-extender';
import PropTypes from 'prop-types';
import {ACTION_PERMISSIONS} from '../actions.constants';
import FilerobotEditor from '~/JContent/actions/editImage/FilerobotEditor';

// The editor works by re-encoding a canvas, which only reliably supports these
// raster formats (they match EXPORT_FORMATS in useSaveEditedImage). Restricting to
// an allowlist keeps the action hidden for types the canvas cannot round-trip
// (svg would rasterize, gif would flatten, bmp/tiff/... would be re-encoded under a
// mismatched extension), rather than silently corrupting them on save.
const EDITABLE_MIMETYPES = ['image/png', 'image/jpeg', 'image/webp'];

const RENDERER_KEY = 'imageEditorDialog';

export const EditImageActionComponent = ({path, render: Render, loading: Loading, ...others}) => {
    const componentRenderer = useContext(ComponentRendererContext);
    const res = useNodeChecks(
        {path},
        {
            showOnNodeTypes: ['jmix:image'],
            requiredPermission: ['jcr:write'],
            requiredSitePermission: [ACTION_PERMISSIONS.openImageEditorAction],
            getMimeType: true
        }
    );

    if (res.loading) {
        return (Loading && <Loading {...others}/>) || false;
    }

    const mimeType = res.node?.mimeType;
    const isVisible = Boolean(res.checksResult) &&
        EDITABLE_MIMETYPES.includes(mimeType);

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
    render: PropTypes.func.isRequired,
    loading: PropTypes.func
};
