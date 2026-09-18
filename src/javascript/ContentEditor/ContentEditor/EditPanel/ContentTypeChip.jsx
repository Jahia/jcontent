import React from 'react';
import {getNodeTypeIcon} from '~/ContentEditor/utils';
import {Area, Chip} from '@jahia/moonstone';
import {useTranslation} from 'react-i18next';
import {useContentEditorContext} from '~/ContentEditor/contexts';
import {getMimeType} from '~/JContent/ContentRoute/ContentLayout/ContentLayout.utils';
import {isAreaList} from '~/JContent/JContent.utils';

export const ContentTypeChip = () => {
    const {t} = useTranslation('jcontent');
    const {nodeData, nodeTypeName, nodeTypeDisplayName} = useContentEditorContext();
    const mimeType = nodeData.isFile ? getMimeType(nodeData) : null;
    const tooltip = mimeType ? null : nodeTypeName;

    // An area is stored as a plain content list, so neither its type name nor the icon
    // registry can tell it apart. The mixin can, and Page Builder already names it this way.
    const isArea = isAreaList(nodeData);

    return (
        <Chip
            color="accent"
            label={mimeType || (isArea ? t('jcontent:label.contentManager.contentType.area') : nodeTypeDisplayName || nodeTypeName)}
            icon={isArea ? <Area/> : getNodeTypeIcon(nodeTypeName)}
            title={tooltip}/>
    );
};
