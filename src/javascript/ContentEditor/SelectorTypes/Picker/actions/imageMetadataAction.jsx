import React, {useContext} from 'react';
import PropTypes from 'prop-types';
import {ComponentRendererContext} from '@jahia/ui-extender';
import {useContentEditorConfigContext} from '~/ContentEditor/contexts';
import {useNodeFileMetadata} from '~/JContent/SidePanel/ContentDetails/useFileMetadata';
import ImageMetadataDialog from './ImageMetadataDialog';

/** The picked item, or nothing while the field is empty or its content is still being resolved */
const pickedItem = inputContext => inputContext?.actionContext?.fieldData?.[0];

export const ImageMetadataActionComponent = ({render: Render, inputContext, ...others}) => {
    const componentRenderer = useContext(ComponentRendererContext);
    const {lang} = useContentEditorConfigContext();
    const item = pickedItem(inputContext);

    // Only an image carries this metadata. Read the mime type of what was actually picked rather
    // than the picker's configured type, so a generic file field holding a photo is covered too.
    const isImage = Boolean(item?.uuid) && Boolean(item.type?.startsWith('image/'));
    const groups = useNodeFileMetadata({uuid: item?.uuid, lang, skip: !isImage});

    // Offer the entry only when there is something behind it, rather than opening onto an
    // apology — most images in a site carry no IPTC at all.
    if (!isImage || groups.length === 0) {
        return false;
    }

    const onExit = () => {
        componentRenderer.destroy('imageMetadataDialog');
    };

    return (
        <Render
            {...others}
            onClick={() => {
                componentRenderer.render('imageMetadataDialog', ImageMetadataDialog, {
                    uuid: item.uuid,
                    lang,
                    displayName: item.displayName || item.name,
                    onExit
                });
            }}
        />
    );
};

ImageMetadataActionComponent.propTypes = {
    render: PropTypes.func.isRequired,
    inputContext: PropTypes.object
};

export const imageMetadataAction = {
    component: ImageMetadataActionComponent
};
