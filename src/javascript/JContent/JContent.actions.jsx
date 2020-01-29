import React from 'react';
import {menuAction} from '@jahia/ui-extender';
import {UnzipIcon, ZipIcon} from './actions/icons';
import {
    Add,
    Autorenew,
    CloudDownload,
    CloudUpload,
    CreateNewFolder,
    Delete,
    DeleteForever,
    Edit,
    FindInPage,
    LibraryAdd,
    Lock,
    LockOpen,
    SubdirectoryArrowRight,
    Translate,
    Visibility
} from '@material-ui/icons';
import {
    Account,
    AccountGroup,
    ApplicationExport,
    ApplicationImport,
    ContentCopy,
    ContentCut,
    ContentPaste,
    DeleteRestore,
    DotsVertical,
    FileUpload,
    ShieldKey,
    TagMultiple,
    Web
} from 'mdi-material-ui';
import createContentAction from './actions/createContentAction';
import fileUploadAction from './actions/fileUploadAction';
import deleteAction from './actions/deleteAction';
import undeleteAction from './actions/undeleteAction';
import deletePermanentlyAction from './actions/deletePermanentlyAction';
import publishAction from './actions/publishAction';
import publishDeletionAction from './actions/publishDeletionAction';
import previewAction from './actions/previewAction';
import pasteAction from './actions/copyPaste/pasteAction';
import copyAction from './actions/copyPaste/copyAction';
import cutAction from './actions/copyPaste/cutAction';
import lockAction from './actions/lockAction';
import {routerAction} from './actions/routerAction';
import openInEditModeAction from './actions/openInEditModeAction';
import unlockAction from './actions/unlockAction';
import clearAllLocksAction from './actions/clearAllLocksAction';
import locateAction from './actions/locateAction';
import translateAction from './actions/translateAction';
import translateMenuAction from './actions/translateMenuAction';
import subContentsAction from './actions/subContentsAction';
import exportAction from './actions/exportAction';
import downloadFileAction from './actions/downloadFileAction';
import createFolderAction from './actions/createFolderAction';
import zipAction from './actions/zipUnzip/zipAction';
import unzipAction from './actions/zipUnzip/unzipAction';
import {MenuItemRenderer} from './MenuItemRenderer';
import {MenuRenderer} from './MenuRenderer';

const PATH_CONTENTS_ITSELF = '^/sites/((?!/).)+/contents/?$';
const PATH_CONTENTS_DESCENDANTS = '^/sites/((?!/).)+/contents/.+';
const PATH_CONTENTS_AND_DESCENDANTS = '^/sites/((?!/).)+/contents/?';

const PATH_FILES_ITSELF = '^/sites/((?!/).)+/files/?$';
const PATH_FILES_DESCENDANTS = '^/sites/((?!/).)+/files/.+';
const PATH_FILES_AND_DESCENDANTS = '^/sites/((?!/).)+/files/?';

const PATH_SYSTEM_SITE_AND_DESCENDANTS = '^/sites/systemsite/?';

function jContentActions(registry) {
    registry.add('action', 'router', routerAction);

    const menuActionWithRenderer = registry.add('action', 'menuAction', menuAction, {
        menuRenderer: MenuRenderer,
        menuItemRenderer: MenuItemRenderer
    });
    registry.add('action', 'preview', previewAction, {
        buttonIcon: <Visibility/>,
        buttonLabel: 'jcontent:label.contentManager.contentPreview.preview',
        hideOnNodeTypes: ['jnt:page', 'jnt:virtualsite'],
        targets: ['contentActions:1']
    });
    registry.add('action', 'createContentFolder', createFolderAction, {
        buttonIcon: <CreateNewFolder/>,
        buttonLabel: 'jcontent:label.contentManager.create.contentFolder',
        targets: ['createMenuActions:3', 'contentActions:2'],
        contentType: 'jnt:contentFolder',
        showOnNodeTypes: ['jnt:contentFolder']
    });
    registry.add('action', 'createContent', createContentAction, {
        buttonIcon: <LibraryAdd/>,
        buttonLabel: 'jcontent:label.contentManager.create.content',
        targets: ['createMenuActions:3.1', 'contentActions:3'],
        showOnNodeTypes: ['jnt:contentFolder', 'jnt:content']
    });
    registry.add('action', 'createFolder', createFolderAction, {
        buttonIcon: <CreateNewFolder/>,
        buttonLabel: 'jcontent:label.contentManager.create.folder',
        targets: ['createMenuActions:3', 'contentActions:3'],
        contentType: 'jnt:folder'
    });
    registry.add('action', 'fileUpload', fileUploadAction, {
        buttonIcon: <FileUpload/>,
        buttonLabel: 'jcontent:label.contentManager.fileUpload.uploadButtonLabel',
        targets: ['createMenuActions:4', 'contentActions:4'],
        contentType: 'jnt:file',
        showOnNodeTypes: ['jnt:folder'],
        requiredPermission: 'jcr:addChildNodes'
    });
    registry.add('action', 'translateMenu', translateMenuAction, {
        buttonIcon: <Translate/>,
        buttonLabel: 'jcontent:label.contentManager.contentPreview.translate',
        targets: ['contentActions:4.5'],
        menu: 'translateMenu'
    });
    registry.add('action', 'translateAction', translateAction, {
        buttonIcon: <Translate/>,
        targets: ['translateMenu']
    });
    registry.add('action', 'publish', publishAction, {
        buttonIcon: <CloudUpload/>,
        buttonLabel: 'jcontent:label.contentManager.contentPreview.publish',
        targets: ['publishMenu:1'],
        allSubtree: false,
        allLanguages: false,
        checkForUnpublication: false,
        checkIfLanguagesMoreThanOne: false,
        hideOnNodeTypes: ['jnt:virtualsite', 'jnt:contentFolder', 'nt:folder']
    });
    registry.add('action', 'publishMenu', menuActionWithRenderer, {
        buttonIcon: <CloudUpload/>,
        buttonLabel: 'jcontent:label.contentManager.contentPreview.publishMenu',
        targets: ['contentActions:6', 'selectedContentActions:5'],
        menuTarget: 'publishMenu',
        menuPreload: true
    });
    registry.add('action', 'publishInAllLanguages', publishAction, {
        buttonIcon: <CloudUpload/>,
        buttonLabel: 'jcontent:label.contentManager.contentPreview.publishInAllLanguages',
        targets: ['publishMenu'],
        hideOnNodeTypes: ['nt:file', 'jnt:contentFolder', 'nt:folder'],
        allSubTree: false,
        allLanguages: true,
        checkForUnpublication: false,
        checkIfLanguagesMoreThanOne: true
    });
    registry.add('action', 'publishAll', publishAction, {
        buttonIcon: <CloudUpload/>,
        buttonLabel: 'jcontent:label.contentManager.contentPreview.publishAll',
        targets: ['publishMenu'],
        showOnNodeTypes: ['jnt:folder', 'jnt:contentFolder', 'jnt:page'],
        allSubTree: true,
        allLanguages: false,
        checkForUnpublication: false,
        checkIfLanguagesMoreThanOne: false
    });
    registry.add('action', 'publishAllInAllLanguages', publishAction, {
        buttonIcon: <CloudUpload/>,
        buttonLabel: 'jcontent:label.contentManager.contentPreview.publishAllInAllLanguages',
        targets: ['publishMenu'],
        showOnNodeTypes: ['jnt:folder', 'jnt:contentFolder', 'jnt:page'],
        allSubTree: true,
        allLanguages: true,
        checkForUnpublication: false,
        checkIfLanguagesMoreThanOne: true
    });
    registry.add('action', 'publishDeletion', publishDeletionAction, {
        buttonIcon: <DeleteForever/>,
        buttonLabel: 'jcontent:label.contentManager.contentPreview.publishDeletion',
        targets: ['contentActions:4', 'selectedContentActions:4'],
        hideOnNodeTypes: ['jnt:virtualsite', 'jnt:page']
    });
    registry.add('action', 'unpublish', publishAction, {
        buttonIcon: <CloudDownload/>,
        buttonLabel: 'jcontent:label.contentManager.contentPreview.unpublish',
        targets: ['publishMenu'],
        hideOnNodeTypes: ['jnt:virtualsite'],
        allSubTree: false,
        allLanguages: false,
        checkForUnpublication: true,
        checkIfLanguagesMoreThanOne: false
    });
    registry.add('action', 'unpublishInAllLanguages', publishAction, {
        buttonIcon: <CloudDownload/>,
        buttonLabel: 'jcontent:label.contentManager.contentPreview.unpublishInAllLanguages',
        targets: ['publishMenu'],
        hideOnNodeTypes: ['nt:file', 'jnt:contentFolder', 'nt:folder'],
        allSubTree: false,
        allLanguages: true,
        checkForUnpublication: true,
        checkIfLanguagesMoreThanOne: true
    });
    registry.add('action', 'contentMenu', menuActionWithRenderer, {
        buttonIcon: <DotsVertical/>,
        buttonLabel: 'jcontent:label.contentManager.contentPreview.moreOptions',
        menuTarget: 'contentActions',
        showIcons: true
    });
    registry.add('action', 'selectedContentMenu', menuActionWithRenderer, {
        buttonIcon: <DotsVertical/>,
        buttonLabel: 'jcontent:label.contentManager.contentPreview.moreOptions',
        menuTarget: 'selectedContentActions',
        menuEmptyMessage: 'label.contentManager.selection.emptyContextMenu',
        showIcons: true
    });
    registry.add('action', 'copy', copyAction, {
        buttonIcon: <ContentCopy/>,
        buttonLabel: 'jcontent:label.contentManager.contentPreview.copy',
        targets: ['contentActions:3.8', 'selectedContentActions:3.8'],
        hideOnNodeTypes: ['jnt:virtualsite', 'jnt:page'],
        hideForPaths: [PATH_FILES_ITSELF, PATH_CONTENTS_ITSELF]
    });
    registry.add('action', 'paste', pasteAction, {
        buttonIcon: <ContentPaste/>,
        buttonLabel: 'jcontent:label.contentManager.contentPreview.paste',
        targets: ['tableHeaderActions:1', 'contentActions:3.91'],
        hideOnNodeTypes: ['jnt:page']
    });
    registry.add('action', 'cut', cutAction, {
        buttonIcon: <ContentCut/>,
        buttonLabel: 'jcontent:label.contentManager.contentPreview.cut',
        targets: ['contentActions:3.9', 'selectedContentActions:3.9'],
        hideOnNodeTypes: ['jnt:page'],
        showForPaths: [PATH_FILES_DESCENDANTS, PATH_CONTENTS_DESCENDANTS]
    });
    registry.add('action', 'delete', deleteAction, {
        buttonIcon: <Delete/>,
        buttonLabel: 'jcontent:label.contentManager.contentPreview.delete',
        targets: ['contentActions:4', 'selectedContentActions:4'],
        hideOnNodeTypes: ['jnt:virtualsite', 'jnt:page'],
        hideForPaths: [PATH_FILES_ITSELF, PATH_CONTENTS_ITSELF]
    });
    registry.add('action', 'deletePermanently', deletePermanentlyAction, {
        buttonIcon: <DeleteForever/>,
        buttonLabel: 'jcontent:label.contentManager.contentPreview.deletePermanently',
        targets: ['contentActions:4', 'selectedContentActions:4'],
        hideOnNodeTypes: ['jnt:virtualsite', 'jnt:page'],
        hideForPaths: [PATH_FILES_ITSELF, PATH_CONTENTS_ITSELF]
    });
    registry.add('action', 'undelete', undeleteAction, {
        buttonIcon: <DeleteRestore/>,
        buttonLabel: 'jcontent:label.contentManager.contentPreview.undelete',
        targets: ['contentActions:4.1', 'selectedContentActions:4.1'],
        hideOnNodeTypes: ['jnt:virtualsite', 'jnt:page'],
        hideForPaths: [PATH_FILES_ITSELF, PATH_CONTENTS_ITSELF]
    });
    registry.add('action', 'createMenu', menuActionWithRenderer, {
        buttonIcon: <Add/>,
        buttonLabel: 'jcontent:label.contentManager.create.create',
        targets: ['tableHeaderActions:10'],
        menuTarget: 'createMenuActions',
        showIcons: true,
        menuPreload: true
    });
    registry.add('action', 'lock', lockAction, {
        buttonLabel: 'jcontent:label.contentManager.contextMenu.lockActions.lock',
        targets: ['contentActions:5'],
        hideOnNodeTypes: ['jnt:page'],
        buttonIcon: <Lock/>
    });
    registry.add('action', 'unlock', unlockAction, {
        buttonLabel: 'jcontent:label.contentManager.contextMenu.lockActions.unlock',
        targets: ['contentActions:5'],
        hideOnNodeTypes: ['jnt:page'],
        buttonIcon: <LockOpen/>
    });
    registry.add('action', 'clearAllLocks', clearAllLocksAction, {
        buttonIcon: <Lock/>,
        buttonLabel: 'jcontent:label.contentManager.contextMenu.lockActions.clearAllLocks',
        targets: ['contentActions:5.5'],
        hideOnNodeTypes: ['jnt:page']
    });
    registry.add('action', 'groups', routerAction, {
        buttonLabel: 'jcontent:label.contentManager.leftMenu.manage.groups.title',
        targets: ['leftMenuManageActions:10'],
        buttonIcon: <AccountGroup/>,
        mode: 'apps',
        iframeUrl: ':context/cms/:frame/:workspace/:lang/sites/:site.manageGroups.html',
        requiredPermission: 'siteAdminGroups'
    });
    registry.add('action', 'languages', routerAction, {
        buttonLabel: 'jcontent:label.contentManager.leftMenu.manage.languages.title',
        targets: ['leftMenuManageActions:20'],
        buttonIcon: <Web/>,
        mode: 'apps',
        iframeUrl: ':context/cms/:frame/:workspace/:lang/sites/:site.manageLanguages.html',
        requiredPermission: 'siteAdminLanguages'
    });
    registry.add('action', 'roles', routerAction, {
        buttonLabel: 'jcontent:label.contentManager.leftMenu.manage.roles.title',
        targets: ['leftMenuManageActions:30'],
        buttonIcon: <ShieldKey/>,
        mode: 'apps',
        iframeUrl: ':context/cms/:frame/:workspace/:lang/sites/:site.manageSiteRoles.html',
        requiredPermission: 'siteAdminSiteRoles'
    });
    registry.add('action', 'users', routerAction, {
        buttonLabel: 'jcontent:label.contentManager.leftMenu.manage.users.title',
        targets: ['leftMenuManageActions:40'],
        buttonIcon: <Account/>,
        mode: 'apps',
        iframeUrl: ':context/cms/:frame/:workspace/:lang/sites/:site.manageUsers.html',
        requiredPermission: 'siteAdminUsers'
    });
    registry.add('action', 'tags', routerAction, {
        buttonLabel: 'jcontent:label.contentManager.leftMenu.manage.tags.title',
        targets: ['leftMenuManageActions:50'],
        buttonIcon: <TagMultiple/>,
        mode: 'apps',
        iframeUrl: ':context/cms/:frame/:workspace/:lang/sites/:site.tagsManager.html',
        requiredPermission: 'tagManager'
    });
    registry.add('action', 'openInEditMode', openInEditModeAction, {
        buttonLabel: 'jcontent:label.contentManager.actions.openInEditMode',
        buttonIcon: <Edit/>,
        targets: ['contentActions'],
        hideForPaths: [PATH_FILES_AND_DESCENDANTS, PATH_CONTENTS_AND_DESCENDANTS, PATH_SYSTEM_SITE_AND_DESCENDANTS]
    });
    registry.add('action', 'locate', locateAction, {
        buttonLabel: 'jcontent:label.contentManager.actions.locate',
        buttonIcon: <FindInPage/>,
        targets: ['contentActions:0.5']
    });
    registry.add('action', 'subContents', subContentsAction, {
        buttonIcon: <SubdirectoryArrowRight/>,
        buttonLabel: 'jcontent:label.contentManager.subContentsAction',
        targets: ['contentActions:0.1'],
        hideOnNodeTypes: ['jnt:virtualsite']
    });
    registry.add('action', 'export', exportAction, {
        buttonIcon: <ApplicationExport/>,
        buttonLabel: 'jcontent:label.contentManager.export.actionLabel',
        targets: ['contentActions:4.2'],
        showOnNodeTypes: ['jnt:page', 'jnt:contentFolder', 'jnt:content']
    });
    registry.add('action', 'import', fileUploadAction, {
        buttonIcon: <ApplicationImport/>,
        buttonLabel: 'jcontent:label.contentManager.import.action',
        targets: ['contentActions:4.3', 'createMenuActions:3.5'],
        showOnNodeTypes: ['jnt:contentFolder'],
        requiredPermission: 'jcr:addChildNodes',
        uploadType: 'import'
    });
    registry.add('action', 'editImage', routerAction, {
        buttonIcon: <Edit/>,
        buttonLabel: 'jcontent:label.contentManager.editImage.action',
        targets: ['contentActions:2.5'],
        requiredPermission: 'jcr:write',
        showOnNodeTypes: ['jmix:image'],
        mode: 'image-edit'
    });
    registry.add('action', 'downloadFile', downloadFileAction, {
        buttonIcon: <CloudDownload/>,
        buttonLabel: 'jcontent:label.contentManager.contentPreview.download',
        showOnNodeTypes: ['jnt:file'],
        targets: ['contentActions:3.7']
    });
    registry.add('action', 'replaceFile', fileUploadAction, {
        buttonIcon: <Autorenew/>,
        buttonLabel: 'jcontent:label.contentManager.fileUpload.replaceWith',
        targets: ['contentActions:0.2'],
        showOnNodeTypes: ['jnt:file'],
        uploadType: 'replaceWith'
    });
    registry.add('action', 'zip', zipAction, {
        buttonIcon: <ZipIcon/>,
        buttonLabel: 'jcontent:label.contentManager.zipUnzip.zip',
        targets: ['contentActions:2.1', 'selectedContentActions'],
        showOnNodeTypes: ['jnt:file', 'jnt:folder'],
        hideForPaths: [PATH_FILES_ITSELF]
    });
    registry.add('action', 'unzip', unzipAction, {
        buttonIcon: <UnzipIcon/>,
        buttonLabel: 'jcontent:label.contentManager.zipUnzip.unzip',
        targets: ['contentActions:2.2'],
        showOnNodeTypes: ['jnt:file'],
        hideForPaths: [PATH_FILES_ITSELF]
    });
}

export default jContentActions;
