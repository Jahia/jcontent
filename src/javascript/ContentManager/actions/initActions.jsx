import React from 'react';
import {menuAction} from '@jahia/react-material';
import ContentIcon from './ContentIcon';
import ManageIcon from './ManageIcon';
import WorkflowIcon from './WorkflowIcon';
import {Add, Delete, DeleteForever, Edit, Lock, LockOpen, Publish, Visibility, SubdirectoryArrowRight, FindInPage} from '@material-ui/icons';
import {
    Account,
    AccountGroup,
    ContentCopy,
    ContentCut,
    ContentPaste,
    DeleteRestore,
    DotsVertical,
    FolderMultipleImage,
    ShieldKey,
    TagMultiple,
    Web
} from 'mdi-material-ui';
import ContentManagerConstants from '../ContentManager.constants';
import createContentOfTypeAction from './createContentOfTypeAction';
import createContentAction from './createContentAction';
import fileUploadAction from './fileUploadAction';
import editAction from './editAction';
import deleteAction from './deleteAction';
import undeleteAction from './undeleteAction';
import deletePermanentlyAction from './deletePermanentlyAction';
import publishAction from './publishAction';
import publishDeletionAction from './publishDeletionAction';
import previewAction from './previewAction';
import pasteAction from './pasteAction';
import copyAction from './copyAction';
import cutAction from './cutAction';
import lockAction from './lockAction';
import workflowDashboardAction from './workflowDashboardAction';
import {routerAction} from './routerAction';
import sideMenuAction from './sideMenuAction';
import sideMenuListAction from './sideMenuListAction';
import openInEditModeAction from './openInEditModeAction';
import unlockAction from './unlockAction';
import clearAllLocksAction from './clearAllLocksAction';
import locateAction from './locateAction';
import translateAction from './translateAction';
import translateMenuAction from './translateMenuAction';
import subContentsAction from './subContentsAction';

const PATH_CONTENTS_ITSELF = '^/sites/.+?/contents/?$';
const PATH_CONTENTS_DESCENDANTS = '^/sites/.+?/contents/.+';
const PATH_CONTENTS_AND_DESCENDANTS = '^/sites/.+?/contents/?';

const PATH_FILES_ITSELF = '^/sites/.+?/files/?$';
const PATH_FILES_DESCENDANTS = '^/sites/.+?/files/.+';
const PATH_FILES_AND_DESCENDANTS = '^/sites/.+?/files/?';

const PATH_SYSTEM_SITE_AND_DESCENDANTS = '^/sites/systemsite/?';

function initActions(actionsRegistry) {
    actionsRegistry.add('router', routerAction);
    actionsRegistry.add('sideMenu', sideMenuAction);
    actionsRegistry.add('sideMenuList', sideMenuListAction);

    actionsRegistry.add('edit', editAction, {
        buttonIcon: <Edit/>,
        buttonLabel: 'label.contentManager.contentPreview.edit',
        target: ['contentActions:2'],
        hideOnNodeTypes: ['jnt:virtualsite'],
        hideForPaths: [PATH_FILES_ITSELF, PATH_CONTENTS_ITSELF]
    });
    actionsRegistry.add('preview', previewAction, {
        buttonIcon: <Visibility/>,
        buttonLabel: 'label.contentManager.contentPreview.preview',
        hideOnNodeTypes: ['jnt:page', 'jnt:virtualsite'],
        target: ['contentActions:1']
    });
    actionsRegistry.add('createContentFolder', createContentOfTypeAction, {
        buttonLabel: 'label.contentManager.create.contentFolder',
        target: ['createMenuActions:3', 'contentActions:2'],
        contentType: 'jnt:contentFolder',
        showOnNodeTypes: ['jnt:contentFolder']
    });
    actionsRegistry.add('createContent', createContentAction, {
        buttonLabel: 'label.contentManager.create.content',
        target: ['createMenuActions:3.1', 'contentActions:3'],
        showOnNodeTypes: ['jnt:contentFolder', 'jnt:content'],
        baseContentType: ContentManagerConstants.contentType
    });
    actionsRegistry.add('createFolder', createContentOfTypeAction, {
        buttonLabel: 'label.contentManager.create.folder',
        target: ['createMenuActions:3', 'contentActions:3'],
        contentType: 'jnt:folder'
    });
    actionsRegistry.add('fileUpload', fileUploadAction, {
        buttonLabel: 'label.contentManager.fileUpload.uploadButtonLabel',
        target: ['createMenuActions:4', 'contentActions:4'],
        contentType: 'jnt:file'
    });
    actionsRegistry.add('translateMenu', translateMenuAction, {
        buttonLabel: 'label.contentManager.contentPreview.translate',
        target: ['contentActions:4.5'],
        menu: 'translateMenu'
    });
    actionsRegistry.add('translateAction', translateAction, {
        target: ['translateMenu']
    });
    actionsRegistry.add('publish', publishAction, {
        buttonIcon: <Publish/>,
        buttonLabel: 'label.contentManager.contentPreview.publish',
        target: ['publishMenu:1'],
        allSubtree: false,
        allLanguages: false,
        checkForUnpublication: false,
        checkIfLanguagesMoreThanOne: false,
        hideOnNodeTypes: ['jnt:virtualsite', 'jnt:contentFolder', 'nt:folder']
    });
    actionsRegistry.add('publishMenu', menuAction, {
        buttonIcon: <Publish/>,
        buttonLabel: 'label.contentManager.contentPreview.publishMenu',
        target: ['contentActions:6', 'selectedContentActions:5'],
        menu: 'publishMenu',
        menuPreload: true
    });
    actionsRegistry.add('publishInAllLanguages', publishAction, {
        buttonIcon: <Publish/>,
        buttonLabel: 'label.contentManager.contentPreview.publishInAllLanguages',
        target: ['publishMenu'],
        hideOnNodeTypes: ['nt:file', 'jnt:contentFolder', 'nt:folder'],
        allSubTree: false,
        allLanguages: true,
        checkForUnpublication: false,
        checkIfLanguagesMoreThanOne: true
    });
    actionsRegistry.add('publishAll', publishAction, {
        buttonIcon: <Publish/>,
        buttonLabel: 'label.contentManager.contentPreview.publishAll',
        target: ['publishMenu'],
        showOnNodeTypes: ['jnt:folder', 'jnt:contentFolder', 'jnt:page'],
        allSubTree: true,
        allLanguages: false,
        checkForUnpublication: false,
        checkIfLanguagesMoreThanOne: false
    });
    actionsRegistry.add('publishAllInAllLanguages', publishAction, {
        buttonIcon: <Publish/>,
        buttonLabel: 'label.contentManager.contentPreview.publishAllInAllLanguages',
        target: ['publishMenu'],
        showOnNodeTypes: ['jnt:folder', 'jnt:contentFolder', 'jnt:page'],
        allSubTree: true,
        allLanguages: true,
        checkForUnpublication: false,
        checkIfLanguagesMoreThanOne: true
    });
    actionsRegistry.add('publishDeletion', publishDeletionAction, {
        buttonIcon: <DeleteForever/>,
        buttonLabel: 'label.contentManager.contentPreview.publishDeletion',
        target: ['contentActions:4', 'selectedContentActions:4'],
        hideOnNodeTypes: ['jnt:virtualsite']
    });
    actionsRegistry.add('unpublish', publishAction, {
        buttonIcon: <Publish/>,
        buttonLabel: 'label.contentManager.contentPreview.unpublish',
        target: ['publishMenu'],
        hideOnNodeTypes: ['jnt:virtualsite'],
        allSubTree: false,
        allLanguages: false,
        checkForUnpublication: true,
        checkIfLanguagesMoreThanOne: false
    });
    actionsRegistry.add('contentMenu', menuAction, {
        buttonIcon: <DotsVertical/>,
        buttonLabel: 'label.contentManager.contentPreview.moreOptions',
        menu: 'contentActions'
    });
    actionsRegistry.add('selectedContentMenu', menuAction, {
        buttonIcon: <DotsVertical/>,
        buttonLabel: 'label.contentManager.contentPreview.moreOptions',
        menu: 'selectedContentActions',
        menuEmptyMessage: 'label.contentManager.selection.emptyContextMenu'
    });
    actionsRegistry.add('duplicate', {
        buttonIcon: <Edit/>,
        buttonLabel: 'label.contentManager.contentPreview.duplicate',
        target: []
    });
    actionsRegistry.add('copy', copyAction, {
        buttonIcon: <ContentCopy/>,
        buttonLabel: 'label.contentManager.contentPreview.copy',
        target: ['contentActions:3.8', 'selectedContentActions:3.8'],
        hideOnNodeTypes: ['jnt:virtualsite', 'jnt:page'],
        hideForPaths: [PATH_FILES_ITSELF, PATH_CONTENTS_ITSELF]
    });
    actionsRegistry.add('paste', pasteAction, {
        buttonIcon: <ContentPaste/>,
        buttonLabel: 'label.contentManager.contentPreview.paste',
        target: ['tableHeaderActions:1', 'contentActions:3.91'],
        hideOnNodeTypes: ['jnt:page'],
        showForPaths: [PATH_FILES_AND_DESCENDANTS, PATH_CONTENTS_AND_DESCENDANTS]
    });
    actionsRegistry.add('cut', cutAction, {
        buttonIcon: <ContentCut/>,
        buttonLabel: 'label.contentManager.contentPreview.cut',
        target: ['contentActions:3.9', 'selectedContentActions:3.9'],
        hideOnNodeTypes: ['jnt:page'],
        showForPaths: [PATH_FILES_DESCENDANTS, PATH_CONTENTS_DESCENDANTS]
    });
    actionsRegistry.add('delete', deleteAction, {
        buttonIcon: <Delete/>,
        buttonLabel: 'label.contentManager.contentPreview.delete',
        target: ['contentActions:4', 'selectedContentActions:4'],
        hideOnNodeTypes: ['jnt:virtualsite', 'jnt:page'],
        hideForPaths: [PATH_FILES_ITSELF, PATH_CONTENTS_ITSELF]
    });
    actionsRegistry.add('deletePermanently', deletePermanentlyAction, {
        buttonIcon: <DeleteForever/>,
        buttonLabel: 'label.contentManager.contentPreview.deletePermanently',
        target: ['contentActions:4', 'selectedContentActions:4'],
        hideOnNodeTypes: ['jnt:virtualsite', 'jnt:page'],
        hideForPaths: [PATH_FILES_ITSELF, PATH_CONTENTS_ITSELF]
    });
    actionsRegistry.add('undelete', undeleteAction, {
        buttonIcon: <DeleteRestore/>,
        buttonLabel: 'label.contentManager.contentPreview.undelete',
        target: ['contentActions:4.1', 'selectedContentActions:4.1'],
        hideOnNodeTypes: ['jnt:virtualsite', 'jnt:page'],
        hideForPaths: [PATH_FILES_ITSELF, PATH_CONTENTS_ITSELF]
    });
    actionsRegistry.add('createMenu', menuAction, {
        buttonIcon: <Add/>,
        buttonLabel: 'label.contentManager.create.create',
        target: ['tableHeaderActions:10'],
        menuPreload: true,
        menu: 'createMenuActions'
    });
    actionsRegistry.add('lock', lockAction, {
        buttonLabel: 'label.contentManager.contextMenu.lockActions.lock',
        target: ['contentActions:5'],
        hideOnNodeTypes: ['jnt:page'],
        buttonIcon: <LockOpen/>
    });
    actionsRegistry.add('unlock', unlockAction, {
        buttonLabel: 'label.contentManager.contextMenu.lockActions.unlock',
        target: ['contentActions:5'],
        hideOnNodeTypes: ['jnt:page'],
        buttonIcon: <Lock/>
    });
    actionsRegistry.add('clearAllLocks', clearAllLocksAction, {
        buttonLabel: 'label.contentManager.contextMenu.lockActions.clearAllLocks',
        target: ['contentActions:5.5'],
        hideOnNodeTypes: ['jnt:page']
    });

    actionsRegistry.add('contentLeftMenu', routerAction, {
        buttonLabel: 'label.contentManager.leftMenu.content',
        target: ['leftMenuActions:1'],
        buttonIcon: <ContentIcon/>,
        mode: 'browse'
    });
    actionsRegistry.add('mediaLeftMenu', routerAction, {
        buttonLabel: 'label.contentManager.leftMenu.media',
        target: ['leftMenuActions:2'],
        buttonIcon: <FolderMultipleImage/>,
        mode: 'browse-files'
    });
    actionsRegistry.add('manageLeftMenu', sideMenuAction, {
        buttonLabel: 'label.contentManager.leftMenu.manage.title',
        // ButtonIcon: <Error/>,
        target: ['leftMenuActions:5'],
        buttonIcon: <ManageIcon/>,
        menu: 'leftMenuManageActions',
        hasChildren: true
    });
    actionsRegistry.add('workflowsLeftMenu', workflowDashboardAction, {
        buttonLabel: 'label.contentManager.leftMenu.workflow',
        buttonIcon: <WorkflowIcon/>,
        target: ['leftMenuBottomActions:6']
    });
    actionsRegistry.add('groups', routerAction, {
        buttonLabel: 'label.contentManager.leftMenu.manage.groups.title',
        target: ['leftMenuManageActions:10'],
        buttonIcon: <AccountGroup/>,
        mode: 'apps',
        iframeUrl: ':context/cms/:frame/:workspace/:lang/sites/:site.manageGroups.html',
        requiredPermission: 'siteAdminGroups'
    });
    actionsRegistry.add('languages', routerAction, {
        buttonLabel: 'label.contentManager.leftMenu.manage.languages.title',
        target: ['leftMenuManageActions:20'],
        buttonIcon: <Web/>,
        mode: 'apps',
        iframeUrl: ':context/cms/:frame/:workspace/:lang/sites/:site.manageLanguages.html',
        requiredPermission: 'siteAdminLanguages'
    });
    actionsRegistry.add('roles', routerAction, {
        buttonLabel: 'label.contentManager.leftMenu.manage.roles.title',
        target: ['leftMenuManageActions:30'],
        buttonIcon: <ShieldKey/>,
        mode: 'apps',
        iframeUrl: ':context/cms/:frame/:workspace/:lang/sites/:site.manageSiteRoles.html',
        requiredPermission: 'siteAdminSiteRoles'
    });
    actionsRegistry.add('users', routerAction, {
        buttonLabel: 'label.contentManager.leftMenu.manage.users.title',
        target: ['leftMenuManageActions:40'],
        buttonIcon: <Account/>,
        mode: 'apps',
        iframeUrl: ':context/cms/:frame/:workspace/:lang/sites/:site.manageUsers.html',
        requiredPermission: 'siteAdminUsers'
    });
    actionsRegistry.add('tags', routerAction, {
        buttonLabel: 'label.contentManager.leftMenu.manage.tags.title',
        target: ['leftMenuManageActions:50'],
        buttonIcon: <TagMultiple/>,
        mode: 'apps',
        iframeUrl: ':context/cms/:frame/:workspace/:lang/sites/:site.tagsManager.html',
        requiredPermission: 'tagManager'
    });
    actionsRegistry.add('openInEditMode', openInEditModeAction, {
        buttonLabel: 'label.contentManager.actions.openInEditMode',
        buttonIcon: <Edit/>,
        target: ['contentActions'],
        hideForPaths: [PATH_FILES_AND_DESCENDANTS, PATH_CONTENTS_AND_DESCENDANTS, PATH_SYSTEM_SITE_AND_DESCENDANTS]
    });
    actionsRegistry.add('locate', locateAction, {
        buttonLabel: 'label.contentManager.actions.locate',
        buttonIcon: <FindInPage/>,
        target: ['contentActions:0.5'],
        hideOnNodeTypes: ['jnt:page', 'jnt:folder', 'jnt:contentFolder']
    });
    actionsRegistry.add('subContents', subContentsAction, {
        buttonIcon: <SubdirectoryArrowRight/>,
        buttonLabel: 'label.contentManager.subContentsAction',
        target: ['contentActions:0.1'],
        hideOnNodeTypes: ['jnt:virtualsite']
    });
}

export default initActions;
