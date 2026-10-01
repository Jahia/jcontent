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

export const TAG_MANAGER_ROUTE_KEY = 'jctagsmanager';
const LEGACY_TAGS_MANAGER_ROUTE_KEY = 'tagsmanager';

export const register = registry => {
    const version = globalThis.contextJsParameters?.config?.graphqlDxmProviderVersion;
    if (version && satisfies(normalize(version), REQUIRED_GQL_DXM_VERSION)) {
        registry.add('adminRoute', TAG_MANAGER_ROUTE_KEY, {
            targets: ['jcontent'],
            label: 'jcontent:label.contentManager.navigation.manage.tags.title',
            icon: <Tag/>,
            isSelectable: true,
            requiredPermission: 'tagManager',
            render: () => <TagManagerRoute/>
        });
    }
};

// The legacy tags module registers its own admin route from a plain script, which app-shell
// evaluates before any module init runs; a late jahiaApp-init callback is therefore guaranteed
// to see it. Only hide it when the new Tag Manager is actually registered, so sites running an
// older graphql-dxm-provider keep the legacy screen.
export const registerLegacyTagsManagerRemoval = registry => {
    registry.add('callback', 'hideLegacyTagsManagerRoute', {
        targets: ['jahiaApp-init:9999'],
        callback: () => {
            if (registry.get('adminRoute', TAG_MANAGER_ROUTE_KEY)) {
                registry.remove('adminRoute', LEGACY_TAGS_MANAGER_ROUTE_KEY);
            }
        }
    });
};
