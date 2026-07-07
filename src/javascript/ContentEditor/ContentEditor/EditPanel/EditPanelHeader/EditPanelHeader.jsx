import React from 'react';
import {DisplayAction, DisplayActions, registry} from '@jahia/ui-extender';
import {ButtonRendererShortLabel, getButtonRenderer} from '~/ContentEditor/utils';
import {truncate} from '~/utils';
import {ButtonGroup, Dropdown, Header, Separator, Workflow} from '@jahia/moonstone';
import styles from './EditPanelHeader.scss';
import {PublishMenu} from './PublishMenu';
import {useTranslation} from 'react-i18next';
import {useContentEditorContext} from '~/ContentEditor/contexts/ContentEditor';
import {EditPanelLanguageSwitcher} from '../EditPanelLanguageSwitcher';
import {HeaderBadges} from '../HeaderBadges';
import PropTypes from 'prop-types';
import {ContentPath} from './ContentPath';
import {HeaderButtonActions, HeaderThreeDotsActions} from '../HeaderActions';
import {ContentTypeChip} from '../ContentTypeChip';
import {useNodeChecks} from '@jahia/data-helper';
import {Constants} from '~/ContentEditor/ContentEditor.constants';
import {useEngineTabAvailability} from '~/ContentEditor/editorTabs/AdvancedOptions/AdvancedOptionsNavigation/useEngineTabAvailability';
import {useOpenEngineTabsWithConfirmation} from '~/ContentEditor/editorTabs/AdvancedOptions/AdvancedOptionsNavigation/useOpenEngineTabsWithConfirmation';

const ButtonRenderer = getButtonRenderer({
    defaultButtonProps: {size: 'big', color: 'accent'}
});

const BackButtonRenderer = getButtonRenderer({
    defaultButtonProps: {size: 'big', variant: 'ghost'},
    noIcon: true
});

export const EditPanelHeader = ({
    title,
    isShowPublish,
    hideLanguageSwitcher,
    activeTabState,
    targetActionKey = 'content-editor/header/3dots'
}) => {
    const ctx = useContentEditorContext();
    const {t} = useTranslation('jcontent');
    const [activeTab, setActiveTab] = activeTabState || [];

    // Some tabs may have `requiresAdvancedPermission: true`, we do a single perm check here
    const res = useNodeChecks({path: ctx.path}, {requiredSitePermission: [Constants.permissions.canSeeAdvancedOptionsTab]});

    const tabs = registry
        .find({target: 'editHeaderTabsActions'})
        .filter(tab => tab.isDisplayable(ctx) && (!tab.requiresAdvancedPermission || res.checksResult));

    const {availableTabs: workflowTabs} = useEngineTabAvailability(['workflow']);
    const {openTabs: openWorkflows, confirmationDialog: workflowsConfirmationDialog} = useOpenEngineTabsWithConfirmation(['workflow']);
    const hasWorkflowsEntry = res.checksResult && workflowTabs.length > 0;

    const tabOptions = tabs.map(tab => ({
        value: tab.value,
        label: t(tab.buttonLabel),
        iconStart: tab.buttonIcon,
        attributes: {'data-sel-role': tab.dataSelRole}
    }));

    // The moonstone Dropdown supports either a flat list or groups only, so entries switch
    // to grouped form (with an unlabeled group on top) once the advanced options section shows
    const dropdownData = hasWorkflowsEntry ? [
        {groupLabel: '', options: tabOptions},
        {
            groupLabel: t('label.contentEditor.edit.tab.advanced'),
            options: [{
                value: 'workflows',
                label: t('label.contentEditor.edit.tab.workflows'),
                iconStart: <Workflow/>,
                attributes: {'data-sel-role': 'tab-workflows'}
            }]
        }
    ] : tabOptions;

    return (
        <Header
            title={truncate(title, 60)}
            breadcrumb={
                ctx.nodeData?.path?.startsWith('/sites') && (
                    <ContentPath path={ctx.nodeData.path}/>
                )
            }
            contentType={<ContentTypeChip/>}
            mainActions={
                <div className={styles.headerMainActions}>
                    <DisplayAction
                        actionKey="backButton"
                        render={BackButtonRenderer}
                        buttonLabel={t('label.contentEditor.close')}
                    />
                    <DisplayActions
                        target="content-editor/header/main-save-actions"
                        render={ButtonRenderer}
                    />

                    {isShowPublish && (
                        <ButtonGroup
                            color="accent"
                            size="big"
                            className={styles.publishActions}
                        >
                            <DisplayActions
                                isMainButton
                                target="content-editor/header/main-publish-actions"
                                buttonProps={{size: 'big', color: 'accent'}}
                                render={ButtonRendererShortLabel}
                            />

                            <PublishMenu/>
                        </ButtonGroup>
                    )}
                </div>
            }
            toolbarLeft={
                <div className={styles.headerToolBar}>
                    {!hideLanguageSwitcher && (
                        <>
                            <EditPanelLanguageSwitcher/>
                            <Separator variant="vertical" size="medium"/>
                        </>
                    )}

                    <HeaderButtonActions targetActionKey={targetActionKey}/>
                    <HeaderThreeDotsActions targetActionKey={targetActionKey}/>
                </div>
            }
            toolbarRight={
                activeTab && (
                    <>
                        {workflowsConfirmationDialog}
                        <Dropdown
                            size="small"
                            value={activeTab}
                            style={{minWidth: '145px'}} // Roughly the size of "Advanced Options"
                            data-sel-role="sel-view-mode-dropdown"
                            data-sel-value={activeTab}
                            data-sel-tab={tabs.find(tab => tab.value === activeTab)?.dataSelRole}
                            data-sel-available-tabs={tabs.map(tab => tab.dataSelRole).join(',')}
                            data={dropdownData}
                            icon={tabs.find(tab => tab.value === activeTab)?.buttonIcon}
                            onChange={(_, item) => {
                                if (item.value === 'workflows') {
                                    openWorkflows();
                                } else {
                                    setActiveTab(item.value);
                                }
                            }}
                        />
                    </>
                )
            }
            status={<HeaderBadges/>}
        />
    );
};

EditPanelHeader.propTypes = {
    title: PropTypes.string.isRequired,
    isShowPublish: PropTypes.bool,
    hideLanguageSwitcher: PropTypes.bool,
    activeTabState: PropTypes.arrayOf(
        PropTypes.exact({
            0: PropTypes.string.isRequired,
            1: PropTypes.func.isRequired
        })
    ),
    targetActionKey: PropTypes.string
};
