import React from 'react';
import {useSelector} from 'react-redux';
import {Tag} from '@jahia/moonstone';
import {TagManager} from './TagManager';

const TagManagerRoute = () => {
    const siteKey = useSelector(state => state.site);
    return <TagManager key={siteKey}/>;
};

export const register = registry => {
    registry.add('adminRoute', 'jctagsmanager', {
        targets: ['jcontent'],
        label: 'jcontent:label.contentManager.navigation.manage.tags.title',
        icon: <Tag/>,
        isSelectable: true,
        requiredPermission: 'tagManager',
        render: () => <TagManagerRoute/>
    });
};
