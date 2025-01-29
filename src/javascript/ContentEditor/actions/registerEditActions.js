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

export const registerEditActions = registry => {
    const showPageBuilder = booleanValue(contextJsParameters.config.jcontent?.showPageBuilder);

    const actionTargets = {
        edit: showPageBuilder ?
            ['contentActions:2', 'accordionContentActions:2', 'headerPrimaryActions:1.5', 'narrowHeaderMenu:1.5', 'visibleContentItemActions:1', 'contentItemContextActions:1'] :
            ['contentActions:2', 'accordionContentActions:2', 'narrowHeaderMenu:1.5', 'visibleContentItemActions:1', 'contentItemContextActions:1'],
        editAdvanced: ['contentActions:2.1', 'accordionContentActions:2.1', 'narrowHeaderMenu:1.6', 'browseControlBar:1', 'contentItemActions:1', 'contentItemContextActions:1'],
        editSource: ['contentActions:2.1', 'accordionContentActions:2.1', 'narrowHeaderMenu:1.1'],
        editPage: showPageBuilder ?
            ['contentActions:2', 'accordionContentActions:2', 'headerPrimaryActions:1.5', 'narrowHeaderMenu:1.5', 'visibleContentItemActions:1', 'contentItemContextActions:1'] :
            ['contentActions:2', 'accordionContentActions:2', 'narrowHeaderMenu:1.5', 'visibleContentItemActions:1', 'contentItemContextActions:1'],
        editPageAdvanced: ['contentActions:2.1', 'accordionContentActions:2.1', 'narrowHeaderMenu:1.6', 'browseControlBar:1', 'contentItemActions:1', 'contentItemContextActions:1'],
        quickEdit: [],
        submitSave: ['content-editor/header/main-save-actions'],
        publishAction: ['content-editor/header/main-publish-actions:1'],
        startWorkflowMainButton: ['content-editor/header/main-publish-actions:1'],
        'content-editor/header/3dots': [],
        'content-editor/field/3dots': [],
        goToWorkInProgress: ['content-editor/header/3dots:1'],
        copyLanguageAction: ['content-editor/header/3dots:2']
    };

    // Edit action button in JContent; need separate actions for content and pages
    registry.add('action', 'edit', editContentAction, {
        buttonIcon: <Edit/>,
        buttonLabel: 'jcontent:label.contentEditor.edit.contentEdit',
        hideOnNodeTypes: ['jnt:virtualsite', 'jnt:page'], // For edit content
        requiredSitePermission: ['editAction'],
        getDisplayName: true
    });

    registry.add('action', 'editAdvanced', editContentAction, {
        buttonIcon: <Edit/>,
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
        buttonIcon: <Edit/>,
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

    /* 3 dots menu actions (for each field) */
    registry.add('action', 'content-editor/field/3dots', registry.get('action', 'menuAction'), {
        buttonIcon: <MoreVert/>,
        buttonLabel: 'jcontent:label.contentEditor.edit.action.moreOptions',
        menuTarget: 'content-editor/field/3dots',
        dataSelRole: '3dotsMenuAction',
        isMenuPreload: true
    });

    registry.add('action', 'goToWorkInProgress', openWorkInProgressAction, {
        dataSelRole: 'workInProgressAction'
    });

    registry.add('action', 'copyLanguageAction', copyLanguageAction, {
        buttonLabel: 'jcontent:label.contentEditor.edit.action.copyLanguage.name'
    });

    // Add targets to actions
    Object.keys(actionTargets).forEach(key => {
        registry.get('action', key).targets = actionTargets[key].map(t => {
            const spl = t.split(':');
            return {id: spl[0], priority: spl[1] ? spl[1] : 0};
        });
    });
};
