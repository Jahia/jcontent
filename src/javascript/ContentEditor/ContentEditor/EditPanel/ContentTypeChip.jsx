import React from 'react';
import {getNodeTypeIcon} from '~/ContentEditor/utils';
import {Chip} from '@jahia/moonstone';
import {useContentEditorContext} from '~/ContentEditor/contexts';
import {getMimeType} from '~/JContent/ContentRoute/ContentLayout/ContentLayout.utils';

export const ContentTypeChip = () => {
    const {nodeData, nodeTypeName, nodeTypeDisplayName} = useContentEditorContext();
    const mimeType = nodeData.isFile ? getMimeType(nodeData) : null;
    const tooltip = mimeType ? null : nodeTypeName;

    return (
        <Chip
            color="accent"
            label={mimeType || nodeTypeDisplayName || nodeTypeName}
            icon={getNodeTypeIcon(nodeTypeName)}
            title={tooltip}/>
    );
};
