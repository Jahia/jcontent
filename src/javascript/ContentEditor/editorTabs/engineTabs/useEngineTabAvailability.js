import {useQuery} from '@apollo/client';
import {engineTabsPermissionCheckQuery} from './engineTabs.permission.gql-query';
import {getGwtEngineTabs} from './engineTabs.utils';
import {useContentEditorContext} from '~/ContentEditor/contexts/ContentEditor';
import {Constants} from '~/ContentEditor/ContentEditor.constants';

/**
 * Resolves which of the given GWT engine tabs are available for the current node,
 * applying the same checks as the advanced options panel entries: the tab must be
 * returned by the GWT authoring API and its required permission (if any) must be granted.
 *
 * @param tabIds array of GWT engine tab ids to look for (e.g. ['workflow'])
 * @returns {{availableTabs: array, loading: boolean, error: object}}
 */
export const useEngineTabAvailability = tabIds => {
    const {nodeData, site, mode} = useContentEditorContext();

    const gwtTabs = (mode === Constants.routes.baseEditRoute && nodeData) ?
        getGwtEngineTabs(nodeData).filter(tab => tabIds.includes(tab.id)) :
        [];

    const {loading, error, data} = useQuery(engineTabsPermissionCheckQuery(gwtTabs, site), {skip: gwtTabs.length === 0});

    return {
        availableTabs: (loading || error) ? [] : gwtTabs.filter(tab => !tab.requiredPermission || Boolean(data?.jcr?.nodeByPath?.[tab.id])),
        loading,
        error
    };
};
