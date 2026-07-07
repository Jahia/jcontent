import {engineTabsPermissionCheckQuery} from './engineTabs.permission.gql-query';
import {registry} from '@jahia/ui-extender';
import {openEngineTabsAction} from './openEngineTabsAction';
import {getGwtEngineTabs} from './engineTabs.utils';
import {useQuery} from '@apollo/client';
import {useContentEditorContext} from '~/ContentEditor/contexts/ContentEditor';

export const tabShouldBeDisplayed = (advancedOptionsTabs, actionKey) => {
    return advancedOptionsTabs.filter(advancedOptionsTab => {
        return advancedOptionsTab.id === actionKey.replace('contentEditorGWTTabAction_', '');
    }).length > 0;
};

/**
 * This function register the actions related to the GWT engine tabs
 */
export const useRegisterEngineTabActions = () => {
    const {nodeData, site} = useContentEditorContext();

    // Get tabs from GWT authoring API
    const tabs = getGwtEngineTabs(nodeData)
        .filter(t => !['contributeMode', 'content', 'metadata', 'layout', 'options', 'categories', 'listOrdering', 'channels', 'history'].includes(t.id));
    const {loading, error, data} = useQuery(engineTabsPermissionCheckQuery(tabs, site));

    if (!error && !loading) {
        // Permission check query
        const actionPrefix = 'contentEditorGWTTabAction_';
        const actionStartPriority = 3;

        tabs
            .forEach((tab, index) => {
                if (!registry.get(actionPrefix + tab.id) && (!tab.requiredPermission || data.jcr.nodeByPath[tab.id])) {
                    registry.addOrReplace('action', actionPrefix + tab.id, openEngineTabsAction, {
                        buttonLabel: tab.title,
                        targets: ['AdvancedOptionsActions:' + (index + actionStartPriority)],
                        tabs: [tab.id],
                        shouldBeDisplayed: tabShouldBeDisplayed
                    });
                }
            });
    }

    return {loading, error, tabs};
};
