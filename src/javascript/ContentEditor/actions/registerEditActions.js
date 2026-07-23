import React from 'react';
import {saveAction} from './contenteditor/save/saveAction';
import {publishAction} from './contenteditor/publish/publishAction';
import {startWorkflowAction} from './contenteditor/startWorkflow/startWorkflowAction';
import {
    AdvancedEdit,
    ArrowRight,
    CloudUpload,
    Copy,
    Edit,
    MoreVert,
    Save,
    Translate,
    VisibilityCondition,
    WorkInProgress
} from '@jahia/moonstone';
import {editContentAction} from './jcontent/editContent/editContentAction';
import {editContentActionWrapper} from './jcontent/editContent/editContentWrapper';
import {editContentTranslationLanguagesFragment} from './jcontent/editContent/editContent.gql-queries';
import {openWorkInProgressAction} from './contenteditor/openWorkInProgress/openWorkInProgressAction';
import {copyLanguageAction} from './contenteditor/copyLanguage/copyLanguageAction';
import {editContentSourceAction} from '~/ContentEditor/actions/jcontent/editContent/editContentSourceAction';
import {editVisibilityRulesAction} from '~/ContentEditor/actions/contenteditor/editVisibilityRules/editVisbilityRules';
import {translateFieldAction} from './contenteditor/translate/translateFieldAction';
import {useTranslateFormDefinition} from '~/ContentEditor/editorTabs/TranslatePanel/useTranslateReadOnlyFormDefinition';
import {Constants} from '../ContentEditor.constants';

export const registerEditActions = registry => {
    // Edit action button in JContent; need separate actions for content and pages
    registry.add('action', 'edit', editContentAction, {
        buttonIcon: <Edit/>,
        buttonLabel: 'jcontent:label.contentEditor.edit.contentEdit',
        hideOnNodeTypes: ['jnt:virtualsite', 'jnt:page'], // For edit content
        requiredSitePermission: ['editAction'],
        getDisplayName: true
    });

    registry.add('action', 'editAdvanced', editContentAction, {
        buttonIcon: <AdvancedEdit/>,
        buttonLabel: 'jcontent:label.contentEditor.edit.contentEditAdvanced',
        hideOnNodeTypes: ['jnt:virtualsite', 'jnt:page'], // For edit content
        requiredSitePermission: ['editAction'],
        getDisplayName: true,
        isFullscreen: true
    });

    // Edit action button in JContent; need separate actions for content and pages
    registry.add('action', 'editSource', editContentSourceAction, {
        buttonIcon: <Edit/>,
        buttonLabel: 'jcontent:label.contentEditor.edit.contentEditSource',
        showOnNodeTypes: ['jnt:content'], // For edit content
        requiredSitePermission: ['editAction'],
        getDisplayName: true
    });

    // Edit action button in JContent; need separate actions for content and pages
    registry.add('action', 'editPage', editContentAction, {
        buttonIcon: <Edit/>,
        buttonLabel: 'jcontent:label.contentEditor.edit.contentEdit',
        showOnNodeTypes: ['jnt:page'], // For edit pages
        requiredSitePermission: ['editPageAction'],
        getDisplayName: true
    });

    registry.add('action', 'editPageAdvanced', editContentAction, {
        buttonIcon: <AdvancedEdit/>,
        buttonLabel: 'jcontent:label.contentEditor.edit.contentEditAdvanced',
        showOnNodeTypes: ['jnt:page'], // For edit pages
        requiredSitePermission: ['editPageAction'],
        getDisplayName: true,
        isFullscreen: true
    });

    // Edit action button in JContent
    registry.add('action', 'quickEdit', editContentAction, {
        buttonIcon: <Edit/>,
        buttonLabel: 'jcontent:label.contentEditor.edit.contentEdit',
        hideOnNodeTypes: ['jnt:virtualsite'],
        getDisplayName: true,
        isFullscreen: false
    });

    // Content-EditorAction
    // Main actions (publish, save and startWorkflow)
    registry.add('action', 'submitSave', saveAction, {
        buttonLabel: 'jcontent:label.contentEditor.edit.action.save.name',
        buttonIcon: <Save/>,
        color: 'accent',
        variant: 'outlined',
        dataSelRole: 'submitSave'
    });

    registry.add('action', 'publishAction', publishAction, {
        buttonIcon: <CloudUpload/>,
        color: 'accent',
        dataSelRole: 'publishAction'
    });

    registry.add('action', 'startWorkflowMainButton', startWorkflowAction, {
        buttonLabel: 'jcontent:label.contentEditor.edit.action.startWorkflow.name',
        buttonIcon: <CloudUpload/>,
        dataSelRole: 'startWorkflowMainButton'
    });

    /* 3 dots menu actions (next to tabs) */
    registry.add('action', 'content-editor/header/3dots', registry.get('action', 'menuAction'), {
        buttonIcon: <MoreVert/>,
        buttonLabel: 'jcontent:label.contentEditor.edit.action.moreOptions',
        menuTarget: 'content-editor/header/3dots',
        dataSelRole: '3dotsMenuAction'
    });

    /* SBS translate 3-dots/header actions */
    registry.add('action', 'translate/header/3dots', registry.get('action', 'menuAction'), {
        buttonIcon: <MoreVert/>,
        buttonLabel: 'jcontent:label.contentEditor.edit.action.moreOptions',
        menuTarget: 'translate/header/3dots',
        dataSelRole: '3dotsMenuAction'
    });

    /* 3 dots menu actions (for each field) */
    registry.add('action', 'content-editor/field/3dots', registry.get('action', 'menuAction'), {
        buttonIcon: <MoreVert/>,
        buttonLabel: 'jcontent:label.contentEditor.edit.action.moreOptions',
        menuTarget: 'content-editor/field/3dots',
        dataSelRole: '3dotsMenuAction',
        isMenuPreload: true
    });

    registry.add('action', 'goToWorkInProgress', openWorkInProgressAction, {
        dataSelRole: 'workInProgressAction',
        buttonIcon: <WorkInProgress/>
    });

    registry.add('action', 'copyLanguageAction', copyLanguageAction, {
        buttonIcon: <Copy/>,
        buttonLabel: 'jcontent:label.contentEditor.edit.action.copyLanguage.name'
    });

    registry.add('action', 'editVisibilityRules', editVisibilityRulesAction, {
        buttonIcon: <VisibilityCondition/>,
        buttonLabel: 'jcontent:label.contentEditor.edit.tab.visibility',
        dataSelRole: 'sbsVisibility',
        requiredSitePermission: ['viewVisibilityTab']
    });

    registry.add('action', 'sbsTranslate', editContentActionWrapper, {
        buttonIcon: <Translate/>,
        // "Translate to": this action translates from the current language to another one (#2484)
        buttonLabel: 'jcontent:label.contentEditor.edit.action.translate.translateToLanguage',
        dataSelRole: 'sbsTranslate',
        showOnNodeTypes: ['jnt:page', 'jmix:mainResource', 'jmix:editorialContent', 'jmix:translatableScreen'],
        requiredSitePermission: ['translateAction'],
        getDisplayName: true,
        getSiteLanguages: true,
        // Needed to default the target to a not-yet-translated language (#2484)
        applyFragment: editContentTranslationLanguagesFragment,
        isFullscreen: true,
        editConfig: {advancedOpenTab: Constants.editPanel.translateTab, useFormDefinition: useTranslateFormDefinition},
        isDisplayable: ({siteInfo}) => siteInfo?.languages?.length > 1
    });

    registry.add('action', 'translateField', translateFieldAction, {
        buttonIcon: <ArrowRight/>,
        buttonLabel: 'jcontent:label.contentEditor.edit.action.translate.name'
    });
};
