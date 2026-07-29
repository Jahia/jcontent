import {Edit, Translate} from '@jahia/moonstone';
import React from 'react';
import {Constants} from '~/ContentEditor/ContentEditor.constants';
import {EditPanelContent} from './EditPanelContent';
import {SidePanel, SidePanelContextProvider} from '~/JContent/SidePanel';
import {useContentEditorContext} from '~/ContentEditor/contexts/ContentEditor';
import {SourceContentPanel} from './TranslatePanel/SourceContentPanel';

/**
 * Bridges the Content Editor context into the shared (JContent) SidePanel, which reads
 * its data from the SidePanelContext. isJContent:false selects the Content Editor preview tab.
 */
const CESidePanel = () => {
    const ceCtx = useContentEditorContext();
    return (
        <SidePanelContextProvider value={{...ceCtx, isJContent: false}}>
            <SidePanel/>
        </SidePanelContextProvider>
    );
};

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
                twoPanelsContentProps={{rightCol: <CESidePanel/>}}
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
        requiredSitePermission: ['translateAction'],
        isDisplayable: ({siteInfo}) => siteInfo?.languages?.length > 1
    });
};
