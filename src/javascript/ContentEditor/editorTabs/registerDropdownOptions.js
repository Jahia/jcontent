import {Edit, Setting, Translate} from '@jahia/moonstone';
import React from 'react';
import {Constants} from '~/ContentEditor/ContentEditor.constants';
import {AdvancedOptions} from './AdvancedOptions';
import {EditPanelContent} from './EditPanelContent';
import {SidePanel} from './EditPanelContent/SidePanel/SidePanel';
import {SourceContentPanel} from './TranslatePanel/SourceContentPanel';

/** Registers the different options available in the advanced (fullscreen) Content Editor */
export const registerDropdownOptions = actionsRegistry => {
    actionsRegistry.add('action', 'ceEditTab', {
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

    actionsRegistry.add('action', 'ceTranslateTab', {
        buttonLabel: 'jcontent:label.contentEditor.edit.action.translate.name',
        buttonIcon: <Translate/>,
        targets: ['editHeaderTabsActions:2'],
        value: Constants.editPanel.translateTab,
        dataSelRole: 'tab-translate',
        displayableComponent: (
            <EditPanelContent
                hasLanguageSwitchTopOfLeftCol
                twoPanelsContentProps={{
                    rightCol: <SourceContentPanel/>,
                    hasSingleSyncedScrollbar: true
                }}
            />
        ),
        editPanelHeaderProps: {hideLanguageSwitcher: true},
        isDisplayable: () => true
    });

    actionsRegistry.add('action', 'ceAdvancedTab', {
        buttonLabel: 'jcontent:label.contentEditor.edit.tab.advanced',
        buttonIcon: <Setting/>,
        targets: ['editHeaderTabsActions:3'],
        value: 'advanced',
        dataSelRole: 'tab-advanced-options',
        displayableComponent: <AdvancedOptions/>,
        editPanelHeaderProps: {hideLanguageSwitcher: true},
        isDisplayable: props => props.mode === Constants.routes.baseEditRoute,
        requiresAdvancedPermission: true
    });
};
