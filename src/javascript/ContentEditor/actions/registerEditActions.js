import React from 'react';
import {saveAction} from './contenteditor/save/saveAction';
import {publishAction} from './contenteditor/publish/publishAction';
import {startWorkflowAction} from './contenteditor/startWorkflow/startWorkflowAction';
import {CloudUpload, Edit, MoreVert, Save} from '@jahia/moonstone';
import {editContentAction} from './jcontent/editContent/editContentAction';
import {openWorkInProgressAction} from './contenteditor/openWorkInProgress/openWorkInProgressAction';
import {copyLanguageAction} from './contenteditor/copyLanguage/copyLanguageAction';
import {booleanValue} from '~/ContentEditor/SelectorTypes/Picker/Picker.utils';
import {editContentSourceAction} from '~/ContentEditor/actions/jcontent/editContent/editContentSourceAction';

export const registerEditActions = actionsRegistry => {
    const showPageBuilder = booleanValue(contextJsParameters.config.jcontent?.showPageBuilder);

    // Edit action button in JContent; need separate actions for content and pages
    actionsRegistry.add('action', 'edit', editContentAction, {
        buttonIcon: <Edit/>,
        buttonLabel: 'jcontent:label.contentEditor.edit.contentEdit',
        targets: showPageBuilder ?
            ['contentActions:2', 'accordionContentActions:2', 'headerPrimaryActions:1.5', 'narrowHeaderMenu:1.5'] :
            ['contentActions:2', 'accordionContentActions:2', 'narrowHeaderMenu:1.5'],
        hideOnNodeTypes: ['jnt:virtualsite', 'jnt:page'], // For edit content
        requiredSitePermission: ['editAction'],
        getDisplayName: true
    });

    actionsRegistry.add('action', 'editAdvanced', editContentAction, {
        buttonIcon: <Edit/>,
        buttonLabel: 'jcontent:label.contentEditor.edit.contentEditAdvanced',
        targets: ['contentActions:2.1', 'accordionContentActions:2.1', 'narrowHeaderMenu:1.6'],
        hideOnNodeTypes: ['jnt:virtualsite', 'jnt:page'], // For edit content
        requiredSitePermission: ['editAction'],
        getDisplayName: true,
        isFullscreen: true
    });

    // Edit action button in JContent; need separate actions for content and pages
    actionsRegistry.add('action', 'editSource', editContentSourceAction, {
        buttonIcon: <Edit/>,
        buttonLabel: 'jcontent:label.contentEditor.edit.contentEditSource',
        targets: ['contentActions:2.1', 'accordionContentActions:2.1', 'narrowHeaderMenu:1.1'],
        showOnNodeTypes: ['jnt:content'], // For edit content
        requiredSitePermission: ['editAction'],
        getDisplayName: true
    });

    // Edit action button in JContent; need separate actions for content and pages
    actionsRegistry.add('action', 'editPage', editContentAction, {
        buttonIcon: <Edit/>,
        buttonLabel: 'jcontent:label.contentEditor.edit.contentEdit',
        targets: showPageBuilder ?
            ['contentActions:2', 'accordionContentActions:2', 'headerPrimaryActions:1.5', 'narrowHeaderMenu:1.5'] :
            ['contentActions:2', 'accordionContentActions:2', 'narrowHeaderMenu:1.5'],
        showOnNodeTypes: ['jnt:page'], // For edit pages
        requiredSitePermission: ['editPageAction'],
        getDisplayName: true
    });

    actionsRegistry.add('action', 'editPageAdvanced', editContentAction, {
        buttonIcon: <Edit/>,
        buttonLabel: 'jcontent:label.contentEditor.edit.contentEditAdvanced',
        targets: ['contentActions:2.1', 'accordionContentActions:2.1', 'narrowHeaderMenu:1.6'],
        showOnNodeTypes: ['jnt:page'], // For edit pages
        requiredSitePermission: ['editPageAction'],
        getDisplayName: true,
        isFullscreen: true
    });

    // Edit action button in JContent
    actionsRegistry.add('action', 'quickEdit', editContentAction, {
        buttonIcon: <Edit/>,
        buttonLabel: 'jcontent:label.contentEditor.edit.contentEdit',
        hideOnNodeTypes: ['jnt:virtualsite'],
        getDisplayName: true,
        isFullscreen: false
    });

    // Content-EditorAction
    // Main actions (publish, save and startWorkflow)
    actionsRegistry.add('action', 'submitSave', saveAction, {
        buttonLabel: 'jcontent:label.contentEditor.edit.action.save.name',
        buttonIcon: <Save/>,
        color: 'accent',
        variant: 'outlined',
        targets: ['content-editor/header/main-save-actions'],
        dataSelRole: 'submitSave'
    });

    actionsRegistry.add('action', 'publishAction', publishAction, {
        buttonIcon: <CloudUpload/>,
        color: 'accent',
        targets: ['content-editor/header/main-publish-actions:1'],
        dataSelRole: 'publishAction'
    });

    actionsRegistry.add('action', 'startWorkflowMainButton', startWorkflowAction, {
        buttonLabel: 'jcontent:label.contentEditor.edit.action.startWorkflow.name',
        buttonIcon: <CloudUpload/>,
        targets: ['content-editor/header/main-publish-actions:1'],
        dataSelRole: 'startWorkflowMainButton'
    });

    /* 3 dots menu actions (next to tabs) */
    actionsRegistry.add('action', 'content-editor/header/3dots', actionsRegistry.get('action', 'menuAction'), {
        buttonIcon: <MoreVert/>,
        buttonLabel: 'jcontent:label.contentEditor.edit.action.moreOptions',
        menuTarget: 'content-editor/header/3dots',
        dataSelRole: '3dotsMenuAction'
    });

    /* 3 dots menu actions (for each field) */
    actionsRegistry.add('action', 'content-editor/field/3dots', actionsRegistry.get('action', 'menuAction'), {
        buttonIcon: <MoreVert/>,
        buttonLabel: 'jcontent:label.contentEditor.edit.action.moreOptions',
        menuTarget: 'content-editor/field/3dots',
        dataSelRole: '3dotsMenuAction',
        isMenuPreload: true
    });

    actionsRegistry.add('action', 'goToWorkInProgress', openWorkInProgressAction, {
        targets: ['content-editor/header/3dots:1'],
        dataSelRole: 'workInProgressAction'
    });

    actionsRegistry.add('action', 'copyLanguageAction', copyLanguageAction, {
        buttonLabel: 'jcontent:label.contentEditor.edit.action.copyLanguage.name',
        targets: ['content-editor/header/3dots:2']
    });
};
