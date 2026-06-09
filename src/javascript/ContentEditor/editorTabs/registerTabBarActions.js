import {Edit, Setting} from '@jahia/moonstone';
import React, {useEffect} from 'react';
import {Constants} from '~/ContentEditor/ContentEditor.constants';
import {
    useContentEditorConfigContext,
    useContentEditorContext
} from '~/shared';
import {SourceContentPanel} from '../actions/contenteditor/translate/TranslatePanel/SourceContentPanel';
import {AdvancedOptions} from './AdvancedOptions';
import {EditPanelContent} from './EditPanelContent';
import {tabBarAction} from './tabBarAction';
import {SidePanel} from './EditPanelContent/SidePanel';

const TranslatePanel = () => {
    const baseConfig = useContentEditorConfigContext();
    const baseContext = useContentEditorContext();
    console.log('baseConfig', baseConfig, 'baseContext', baseContext);

    const {lang, siteInfo} = baseContext;
    const languages = siteInfo.languages?.filter(l => l.activeInEdit) || [];
    const sourceLang =
        languages.find(l => l.language !== lang) || languages[0];

    // UseEffect(() => {
    //     baseConfig.setSideBySideContext({
    //         lang: sourceLang.language,
    //         ...baseConfig.sideBySideContext
    //     });
    // }, [baseConfig.sideBySideContext]);

    return (
        <SourceContentPanel/>
    );
};

export const registerTabBarActions = actionsRegistry => {
    // Tab bar actions
    actionsRegistry.add('action', 'ceEditTab', tabBarAction, {
        buttonLabel: 'jcontent:label.contentEditor.edit.tab.edit',
        buttonIcon: <Edit/>,
        targets: ['editHeaderTabsActions:1'],
        value: Constants.editPanel.editTab,
        dataSelRole: 'tab-edit',
        displayableComponent: EditPanelContent,
        side: {component: SidePanel, singleSyncedScrollbar: false},
        isDisplayable: () => true
    });

    actionsRegistry.add('action', 'ceAdvancedTab', tabBarAction, {
        buttonLabel: 'jcontent:label.contentEditor.edit.tab.advanced',
        buttonIcon: <Setting/>,
        targets: ['editHeaderTabsActions:2'],
        value: 'advanced',
        dataSelRole: 'tab-advanced-options',
        displayableComponent: AdvancedOptions,
        isDisplayable: props => props.mode === Constants.routes.baseEditRoute,
        requiredPermission: [Constants.permissions.canSeeAdvancedOptionsTab]
    });

    actionsRegistry.add('action', 'ceTranslateTab', tabBarAction, {
        buttonLabel: 'jcontent:label.contentEditor.edit.tab.translate',
        buttonIcon: <Setting/>,
        targets: ['editHeaderTabsActions:3'],
        value: 'translate',
        dataSelRole: 'tab-advanced-options',
        displayableComponent: EditPanelContent,
        side: {component: TranslatePanel, singleSyncedScrollbar: true},
        isDisplayable: () => true
    });
};
