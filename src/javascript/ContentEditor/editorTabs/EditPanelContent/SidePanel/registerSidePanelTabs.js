import React from 'react';
import {sidePanelTabAction} from './sidePanelTabAction';
import {InfoCircle, History, Visibility} from '@jahia/moonstone';
import {ContentDetails} from './ContentDetails';
import {ContentHistory} from './ContentHistory';
import {CEPreview} from '../Preview';
import {JContentPreview} from '~/JContent/ContentRoute/ContentLayout/PreviewDrawer/Preview/JContentPreview';

export const registerSidePanelTabs = actionsRegistry => {
    actionsRegistry.add('action', 'ceSidePanelDetailsTab', sidePanelTabAction, {
        buttonLabel: 'jcontent:label.contentEditor.sidePanel.details',
        buttonIcon: <InfoCircle/>,
        targets: ['sidePanelTabsActions:2'],
        dataSelRole: 'tab-details',
        displayableComponent: ContentDetails,
        isDisplayable: () => true
    });

    actionsRegistry.add('action', 'ceSidePanelHistoryTab', sidePanelTabAction, {
        buttonLabel: 'jcontent:label.contentEditor.sidePanel.history',
        buttonIcon: <History/>,
        targets: ['sidePanelTabsActions:3'],
        dataSelRole: 'tab-history',
        displayableComponent: ContentHistory,
        isDisplayable: () => true,
        requiredPermission: ['viewHistoryTab']
    });

    actionsRegistry.add('action', 'ceSidePanelPreviewTab', sidePanelTabAction, {
        buttonLabel: 'jcontent:label.contentEditor.sidePanel.preview',
        buttonIcon: <Visibility/>,
        targets: ['sidePanelTabsActions:1'],
        dataSelRole: 'tab-preview',
        displayableComponent: CEPreview,
        isDisplayable: ({hasPreview, isJContent}) => Boolean(hasPreview) && !isJContent
    });

    actionsRegistry.add('action', 'jcontentSidePanelPreviewTab', sidePanelTabAction, {
        buttonLabel: 'jcontent:label.contentManager.contentPreview.preview',
        buttonIcon: <Visibility/>,
        targets: ['sidePanelTabsActions:1'],
        dataSelRole: 'tab-preview',
        displayableComponent: JContentPreview,
        isDisplayable: ({isJContent}) => Boolean(isJContent)
    });
};
