import React from 'react';
import {sidePanelTabAction} from './sidePanelTabAction';
import {ContentReference, InfoCircle, History, Visibility} from '@jahia/moonstone';
import {ContentDetails} from './ContentDetails';
import {ContentHistory} from './ContentHistory';
import {ContentUsages} from './ContentUsages';
import {CEPreview} from '~/ContentEditor/editorTabs/EditPanelContent/Preview';
import {JContentPreview} from '~/JContent/ContentRoute/ContentLayout/PreviewDrawer/Preview/JContentPreview';
import {Constants} from '~/ContentEditor/ContentEditor.constants';

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

    actionsRegistry.add('action', 'ceSidePanelUsagesTab', sidePanelTabAction, {
        buttonLabel: 'jcontent:label.contentEditor.sidePanel.usages',
        buttonIcon: <ContentReference/>,
        targets: ['sidePanelTabsActions:4'],
        dataSelRole: 'tab-usages',
        displayableComponent: ContentUsages,
        hideOnNodeTypes: ['jnt:virtualsite'],
        // Same permission as the usages entry of the former advanced options screen
        requiredPermission: ['viewUsagesTab'],
        // In Content Editor the tab only makes sense in edit mode: in create mode
        // ctx.path points to the parent node
        isDisplayable: ({isJContent, mode}) => Boolean(isJContent) || mode === Constants.routes.baseEditRoute
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
