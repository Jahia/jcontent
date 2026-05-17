import React from 'react';
import {sidePanelTabAction} from './sidePanelTabAction';
import {InfoCircle, History, Visibility} from '@jahia/moonstone';
import {Constants} from '~/ContentEditor/ContentEditor.constants';
import {ContentDetails} from './ContentDetails';
import {ContentHistory} from './ContentHistory';
import {Preview} from '../Preview';

export const registerSidePanelTabs = actionsRegistry => {
    // Side panel tab actions
    actionsRegistry.add('action', 'ceSidePanelDetailsTab', sidePanelTabAction, {
        buttonLabel: 'jcontent:label.contentEditor.sidePanel.details',
        buttonIcon: <InfoCircle/>,
        targets: ['sidePanelTabsActions:2'],
        value: 'details',
        dataSelRole: 'tab-details',
        displayableComponent: ContentDetails,
        isDisplayable: () => true,
        requiredPermission: [Constants.permissions.canSeeDetailsTab]
    });

    actionsRegistry.add('action', 'ceSidePanelHistoryTab', sidePanelTabAction, {
        buttonLabel: 'jcontent:label.contentEditor.sidePanel.history',
        buttonIcon: <History/>,
        targets: ['sidePanelTabsActions:3'],
        value: 'history',
        dataSelRole: 'tab-history',
        displayableComponent: ContentHistory,
        isDisplayable: () => true,
        requiredPermission: [Constants.permissions.canSeeHistoryTab, 'viewHistoryTab']
    });

    actionsRegistry.add('action', 'ceSidePanelPreviewTab', sidePanelTabAction, {
        buttonLabel: 'jcontent:label.contentEditor.sidePanel.preview',
        buttonIcon: <Visibility/>,
        targets: ['sidePanelTabsActions:1'],
        value: 'preview',
        dataSelRole: 'tab-preview',
        displayableComponent: Preview,
        isDisplayable: () => true,
        requiredPermission: [Constants.permissions.canSeePreviewTab]
    });
};
