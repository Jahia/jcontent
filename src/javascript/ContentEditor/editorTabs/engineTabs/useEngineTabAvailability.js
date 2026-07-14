import React from 'react';
import {useQuery} from '@apollo/client';
import {engineTabsPermissionCheckQuery} from './engineTabs.permission.gql-query';
import {getGwtEngineTabs} from './engineTabs.utils';
import {Constants} from '~/ContentEditor/ContentEditor.constants';
import {EditRole, LiveRole, Version, Workflow} from '@jahia/moonstone';

/**
 * Resolves which of the given GWT engine tabs are available for the current node,
 * applying the same checks as the advanced options panel entries: the tab must be
 * returned by the GWT authoring API and its required permission (if any) must be granted.
 *
 * @param tabIds array of GWT engine tab ids to look for (e.g. ['workflow'])
 * @returns {{engineTabIds: string[], engineTabs: array}}
 */
export const useEngineTabAvailability = ({nodeData, site, mode}) => {
    const engineTabDefs = {
        editroles: {icon: <EditRole/>},
        liveroles: {icon: <LiveRole/>},
        versioning: {icon: <Version/>},
        workflow: {icon: <Workflow/>}
    };
    const engineTabIds = Object.keys(engineTabDefs);

    // Preserve order of engineTabIds; insert icons to gwtTabs for use in the dropdown
    const allGwtTabs = (mode === Constants.routes.baseEditRoute && nodeData) ? getGwtEngineTabs(nodeData) : [];
    const gwtTabsById = Object.fromEntries(allGwtTabs.map(tab => [tab.id, tab]));
    const gwtTabs = engineTabIds
        .map(id => gwtTabsById[id] && {...gwtTabsById[id], icon: engineTabDefs[id].icon})
        .filter(Boolean);

    const {loading, error, data} = useQuery(
        engineTabsPermissionCheckQuery(gwtTabs, site),
        {skip: gwtTabs.length === 0}
    );

    let engineTabs = [];
    if (!loading && !error) {
        engineTabs = gwtTabs.filter(tab => !tab.requiredPermission || Boolean(data?.jcr?.nodeByPath?.[tab.id]));
    }

    return {engineTabIds, engineTabs};
};
