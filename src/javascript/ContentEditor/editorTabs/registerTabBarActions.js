import {Edit, Setting, Translate} from '@jahia/moonstone';
import React from 'react';
import {Constants} from '~/ContentEditor/ContentEditor.constants';
import {SourceContentPanel} from '../actions/contenteditor/translate/TranslatePanel/SourceContentPanel';
import {AdvancedOptions} from './AdvancedOptions';
import {EditPanelContent} from './EditPanelContent';
import {tabBarAction} from './tabBarAction';
import {SidePanel} from './EditPanelContent/SidePanel/SidePanel';

/** Registers the different options available in the advanced (fullscreen) Content Editor */
export const registerTabBarActions = actionsRegistry => {
    actionsRegistry.add('action', 'ceEditTab', tabBarAction, {
        buttonLabel: 'jcontent:label.contentEditor.edit.tab.edit',
        buttonIcon: <Edit/>,
        targets: ['editHeaderTabsActions:1'],
        value: Constants.editPanel.editTab,
        dataSelRole: 'tab-edit',
        displayableComponent: (
            <EditPanelContent
                twoPanelsContentProps={{rightCol: <SidePanel/>}}
            />
        ),
        isDisplayable: () => true
    });

    actionsRegistry.add('action', 'ceTranslateTab', tabBarAction, {
        buttonLabel: 'jcontent:label.contentEditor.edit.action.translate.name',
        buttonIcon: <Translate/>,
        targets: ['editHeaderTabsActions:2'],
        value: Constants.editPanel.translateTab,
        dataSelRole: 'tab-translate',
        displayableComponent: (
            <EditPanelContent
                languageSwitchTopOfLeftCol
                twoPanelsContentProps={{
                    rightCol: <SourceContentPanel/>,
                    hasSingleSyncedScrollbar: true
                }}
            />
        ),
        editPanelHeaderProps: {hideLanguageSwitcher: true},
        isDisplayable: () => true,
        requiredSitePermission: ['translateAction']
    });

    actionsRegistry.add('action', 'ceAdvancedTab', tabBarAction, {
        buttonLabel: 'jcontent:label.contentEditor.edit.tab.advanced',
        buttonIcon: <Setting/>,
        targets: ['editHeaderTabsActions:3'],
        value: 'advanced',
        dataSelRole: 'tab-advanced-options',
        displayableComponent: <AdvancedOptions/>,
        editPanelHeaderProps: {hideLanguageSwitcher: true},
        isDisplayable: props => props.mode === Constants.routes.baseEditRoute,
        requiredPermission: [Constants.permissions.canSeeAdvancedOptionsTab]
    });
};
