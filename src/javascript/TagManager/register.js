import React from 'react';
import {useSelector} from 'react-redux';
import {Tag} from '@jahia/moonstone';
import {satisfies} from 'compare-versions';
import {TagManager} from './TagManager';

const normalize = v => v?.match(/\d+/g)?.join('.');
const REQUIRED_GQL_DXM_VERSION = '>=3.8';

const TagManagerRoute = () => {
    const siteKey = useSelector(state => state.site);
    return <TagManager key={siteKey}/>;
};

export const register = registry => {
    const version = window.contextJsParameters?.config?.graphqlDxmProviderVersion;
    if (version && satisfies(normalize(version), REQUIRED_GQL_DXM_VERSION)) {
        registry.add('adminRoute', 'jctagsmanager', {
            targets: ['jcontent'],
            label: 'jcontent:label.contentManager.navigation.manage.tags.title',
            icon: <Tag/>,
            isSelectable: true,
            requiredPermission: 'tagManager',
            render: () => <TagManagerRoute/>
        });
    }
};
