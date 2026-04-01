import React from 'react';
import {Tag} from '@jahia/moonstone';
import {TagManager} from './TagManager';

export const register = registry => {
    registry.add('adminRoute', 'tagsmanager', {
        targets: ['jcontent:50'],
        label: 'jcontent:label.contentManager.navigation.manage.tags.title',
        icon: <Tag/>,
        isSelectable: true,
        requiredPermission: 'tagManager',
        render: () => <TagManager/>
    });
};
