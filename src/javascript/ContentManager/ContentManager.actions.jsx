import React from 'react';
import {menuAction} from '@jahia/react-material';
import {ContentIcon, ZipIcon, UnzipIcon} from './actions/icons';
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
    FolderMultipleImage,
    ShieldKey,
    TagMultiple,
    Web
} from 'mdi-material-ui';
import createContentAction from './actions/createContentAction';
import fileUploadAction from './actions/fileUploadAction';
import editAction from './actions/editAction';
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
import sideMenuAction from './actions/sideMenuAction';
import sideMenuListAction from './actions/sideMenuListAction';
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

const PATH_CONTENTS_ITSELF = '^/sites/.+?/contents/?$';
const PATH_CONTENTS_DESCENDANTS = '^/sites/.+?/contents/.+';
const PATH_CONTENTS_AND_DESCENDANTS = '^/sites/.+?/contents/?';

const PATH_FILES_ITSELF = '^/sites/.+?/files/?$';
const PATH_FILES_DESCENDANTS = '^/sites/.+?/files/.+';
const PATH_FILES_AND_DESCENDANTS = '^/sites/.+?/files/?';

const PATH_SYSTEM_SITE_AND_DESCENDANTS = '^/sites/systemsite/?';

function contentManagerActions(actionsRegistry, t) {
    actionsRegistry.add('router', routerAction);
    actionsRegistry.add('sideMenu', sideMenuAction);
    actionsRegistry.add('sideMenuList', sideMenuListAction);

    actionsRegistry.add('edit', editAction, {
        buttonIcon: <Edit/>,
        buttonLabel: 'content-media-manager:label.contentManager.contentPreview.edit',
        target: ['contentActions:2'],
        hideOnNodeTypes: ['jnt:virtualsite'],
        hideForPaths: [PATH_FILES_ITSELF, PATH_CONTENTS_ITSELF]
    });
    actionsRegistry.add('preview', previewAction, {
        buttonIcon: <Visibility/>,
        buttonLabel: 'content-media-manager:label.contentManager.contentPreview.preview',
        hideOnNodeTypes: ['jnt:page', 'jnt:virtualsite'],
        target: ['contentActions:1']
    });
    actionsRegistry.add('createContentFolder', createFolderAction, {
        buttonIcon: <CreateNewFolder/>,
        buttonLabel: 'content-media-manager:label.contentManager.create.contentFolder',
        target: ['createMenuActions:3', 'contentActions:2'],
        contentType: 'jnt:contentFolder',
        showOnNodeTypes: ['jnt:contentFolder']
    });
    actionsRegistry.add('createContent', createContentAction, {
        buttonIcon: <LibraryAdd/>,
        buttonLabel: 'content-media-manager:label.contentManager.create.content',
        target: ['createMenuActions:3.1', 'contentActions:3'],
        showOnNodeTypes: ['jnt:contentFolder', 'jnt:content']
    });
    actionsRegistry.add('createFolder', createFolderAction, {
        buttonIcon: <CreateNewFolder/>,
        buttonLabel: 'content-media-manager:label.contentManager.create.folder',
        target: ['createMenuActions:3', 'contentActions:3'],
        contentType: 'jnt:folder'
    });
    actionsRegistry.add('fileUpload', fileUploadAction, {
        buttonIcon: <FileUpload/>,
        buttonLabel: 'content-media-manager:label.contentManager.fileUpload.uploadButtonLabel',
        target: ['createMenuActions:4', 'contentActions:4'],
        contentType: 'jnt:file',
        showOnNodeTypes: ['jnt:folder'],
        requiredPermission: 'jcr:addChildNodes'
    });
    actionsRegistry.add('translateMenu', translateMenuAction, {
        buttonIcon: <Translate/>,
        buttonLabel: 'content-media-manager:label.contentManager.contentPreview.translate',
        target: ['contentActions:4.5'],
        menu: 'translateMenu'
    });
    actionsRegistry.add('translateAction', translateAction, {
        buttonIcon: <Translate/>,
        target: ['translateMenu']
    });
    actionsRegistry.add('publish', publishAction, {
        buttonIcon: <CloudUpload/>,
        buttonLabel: 'content-media-manager:label.contentManager.contentPreview.publish',
        target: ['publishMenu:1'],
        allSubtree: false,
        allLanguages: false,
        checkForUnpublication: false,
        checkIfLanguagesMoreThanOne: false,
        hideOnNodeTypes: ['jnt:virtualsite', 'jnt:contentFolder', 'nt:folder']
    });
    actionsRegistry.add('publishMenu', menuAction, {
        buttonIcon: <CloudUpload/>,
        buttonLabel: 'content-media-manager:label.contentManager.contentPreview.publishMenu',
        target: ['contentActions:6', 'selectedContentActions:5'],
        menu: 'publishMenu',
        menuPreload: true
    });
    actionsRegistry.add('publishInAllLanguages', publishAction, {
        buttonIcon: <CloudUpload/>,
        buttonLabel: 'content-media-manager:label.contentManager.contentPreview.publishInAllLanguages',
        target: ['publishMenu'],
        hideOnNodeTypes: ['nt:file', 'jnt:contentFolder', 'nt:folder'],
        allSubTree: false,
        allLanguages: true,
        checkForUnpublication: false,
        checkIfLanguagesMoreThanOne: true
    });
    actionsRegistry.add('publishAll', publishAction, {
        buttonIcon: <CloudUpload/>,
        buttonLabel: 'content-media-manager:label.contentManager.contentPreview.publishAll',
        target: ['publishMenu'],
        showOnNodeTypes: ['jnt:folder', 'jnt:contentFolder', 'jnt:page'],
        allSubTree: true,
        allLanguages: false,
        checkForUnpublication: false,
        checkIfLanguagesMoreThanOne: false
    });
    actionsRegistry.add('publishAllInAllLanguages', publishAction, {
        buttonIcon: <CloudUpload/>,
        buttonLabel: 'content-media-manager:label.contentManager.contentPreview.publishAllInAllLanguages',
        target: ['publishMenu'],
        showOnNodeTypes: ['jnt:folder', 'jnt:contentFolder', 'jnt:page'],
        allSubTree: true,
        allLanguages: true,
        checkForUnpublication: false,
        checkIfLanguagesMoreThanOne: true
    });
    actionsRegistry.add('publishDeletion', publishDeletionAction, {
        buttonIcon: <DeleteForever/>,
        buttonLabel: 'content-media-manager:label.contentManager.contentPreview.publishDeletion',
        target: ['contentActions:4', 'selectedContentActions:4'],
        hideOnNodeTypes: ['jnt:virtualsite', 'jnt:page']
    });
    actionsRegistry.add('unpublish', publishAction, {
        buttonIcon: <CloudDownload/>,
        buttonLabel: 'content-media-manager:label.contentManager.contentPreview.unpublish',
        target: ['publishMenu'],
        hideOnNodeTypes: ['jnt:virtualsite'],
        allSubTree: false,
        allLanguages: false,
        checkForUnpublication: true,
        checkIfLanguagesMoreThanOne: false
    });
    actionsRegistry.add('unpublishInAllLanguages', publishAction, {
        buttonIcon: <CloudDownload/>,
        buttonLabel: 'content-media-manager:label.contentManager.contentPreview.unpublishInAllLanguages',
        target: ['publishMenu'],
        hideOnNodeTypes: ['nt:file', 'jnt:contentFolder', 'nt:folder'],
        allSubTree: false,
        allLanguages: true,
        checkForUnpublication: true,
        checkIfLanguagesMoreThanOne: true
    });
    actionsRegistry.add('contentMenu', menuAction, {
        buttonIcon: <DotsVertical/>,
        buttonLabel: 'content-media-manager:label.contentManager.contentPreview.moreOptions',
        menu: 'contentActions',
        showIcons: true
    });
    actionsRegistry.add('selectedContentMenu', menuAction, {
        buttonIcon: <DotsVertical/>,
        buttonLabel: 'content-media-manager:label.contentManager.contentPreview.moreOptions',
        menu: 'selectedContentActions',
        menuEmptyMessage: 'label.contentManager.selection.emptyContextMenu',
        showIcons: true
    });
    actionsRegistry.add('copy', copyAction, {
        buttonIcon: <ContentCopy/>,
        buttonLabel: 'content-media-manager:label.contentManager.contentPreview.copy',
        target: ['contentActions:3.8', 'selectedContentActions:3.8'],
        hideOnNodeTypes: ['jnt:virtualsite', 'jnt:page'],
        hideForPaths: [PATH_FILES_ITSELF, PATH_CONTENTS_ITSELF]
    });
    actionsRegistry.add('paste', pasteAction, {
        buttonIcon: <ContentPaste/>,
        buttonLabel: 'content-media-manager:label.contentManager.contentPreview.paste',
        target: ['tableHeaderActions:1', 'contentActions:3.91'],
        hideOnNodeTypes: ['jnt:page']
    });
    actionsRegistry.add('cut', cutAction, {
        buttonIcon: <ContentCut/>,
        buttonLabel: 'content-media-manager:label.contentManager.contentPreview.cut',
        target: ['contentActions:3.9', 'selectedContentActions:3.9'],
        hideOnNodeTypes: ['jnt:page'],
        showForPaths: [PATH_FILES_DESCENDANTS, PATH_CONTENTS_DESCENDANTS]
    });
    actionsRegistry.add('delete', deleteAction, {
        buttonIcon: <Delete/>,
        buttonLabel: 'content-media-manager:label.contentManager.contentPreview.delete',
        target: ['contentActions:4', 'selectedContentActions:4'],
        hideOnNodeTypes: ['jnt:virtualsite', 'jnt:page'],
        hideForPaths: [PATH_FILES_ITSELF, PATH_CONTENTS_ITSELF]
    });
    actionsRegistry.add('deletePermanently', deletePermanentlyAction, {
        buttonIcon: <DeleteForever/>,
        buttonLabel: 'content-media-manager:label.contentManager.contentPreview.deletePermanently',
        target: ['contentActions:4', 'selectedContentActions:4'],
        hideOnNodeTypes: ['jnt:virtualsite', 'jnt:page'],
        hideForPaths: [PATH_FILES_ITSELF, PATH_CONTENTS_ITSELF]
    });
    actionsRegistry.add('undelete', undeleteAction, {
        buttonIcon: <DeleteRestore/>,
        buttonLabel: 'content-media-manager:label.contentManager.contentPreview.undelete',
        target: ['contentActions:4.1', 'selectedContentActions:4.1'],
        hideOnNodeTypes: ['jnt:virtualsite', 'jnt:page'],
        hideForPaths: [PATH_FILES_ITSELF, PATH_CONTENTS_ITSELF]
    });
    actionsRegistry.add('createMenu', menuAction, {
        buttonIcon: <Add/>,
        buttonLabel: 'content-media-manager:label.contentManager.create.create',
        target: ['tableHeaderActions:10'],
        menu: 'createMenuActions',
        showIcons: true,
        menuPreload: true
    });
    actionsRegistry.add('lock', lockAction, {
        buttonLabel: 'content-media-manager:label.contentManager.contextMenu.lockActions.lock',
        target: ['contentActions:5'],
        hideOnNodeTypes: ['jnt:page'],
        buttonIcon: <Lock/>
    });
    actionsRegistry.add('unlock', unlockAction, {
        buttonLabel: 'content-media-manager:label.contentManager.contextMenu.lockActions.unlock',
        target: ['contentActions:5'],
        hideOnNodeTypes: ['jnt:page'],
        buttonIcon: <LockOpen/>
    });
    actionsRegistry.add('clearAllLocks', clearAllLocksAction, {
        buttonIcon: <Lock/>,
        buttonLabel: 'content-media-manager:label.contentManager.contextMenu.lockActions.clearAllLocks',
        target: ['contentActions:5.5'],
        hideOnNodeTypes: ['jnt:page']
    });

    actionsRegistry.add('contentLeftMenu', routerAction, {
        buttonLabel: t('content-media-manager:label.contentManager.leftMenu.content'),
        target: ['leftMenuActions:1'],
        buttonIcon: <ContentIcon/>,
        mode: 'browse'
    });
    actionsRegistry.add('mediaLeftMenu', routerAction, {
        buttonLabel: t('content-media-manager:label.contentManager.leftMenu.media'),
        target: ['leftMenuActions:2'],
        buttonIcon: <FolderMultipleImage/>,
        mode: 'browse-files'
    });
    actionsRegistry.add('groups', routerAction, {
        buttonLabel: t('content-media-manager:label.contentManager.leftMenu.manage.groups.title'),
        target: ['leftMenuManageActions:10'],
        buttonIcon: <AccountGroup/>,
        mode: 'apps',
        iframeUrl: ':context/cms/:frame/:workspace/:lang/sites/:site.manageGroups.html',
        requiredPermission: 'siteAdminGroups'
    });
    actionsRegistry.add('languages', routerAction, {
        buttonLabel: t('content-media-manager:label.contentManager.leftMenu.manage.languages.title'),
        target: ['leftMenuManageActions:20'],
        buttonIcon: <Web/>,
        mode: 'apps',
        iframeUrl: ':context/cms/:frame/:workspace/:lang/sites/:site.manageLanguages.html',
        requiredPermission: 'siteAdminLanguages'
    });
    actionsRegistry.add('roles', routerAction, {
        buttonLabel: t('content-media-manager:label.contentManager.leftMenu.manage.roles.title'),
        target: ['leftMenuManageActions:30'],
        buttonIcon: <ShieldKey/>,
        mode: 'apps',
        iframeUrl: ':context/cms/:frame/:workspace/:lang/sites/:site.manageSiteRoles.html',
        requiredPermission: 'siteAdminSiteRoles'
    });
    actionsRegistry.add('users', routerAction, {
        buttonLabel: t('content-media-manager:label.contentManager.leftMenu.manage.users.title'),
        target: ['leftMenuManageActions:40'],
        buttonIcon: <Account/>,
        mode: 'apps',
        iframeUrl: ':context/cms/:frame/:workspace/:lang/sites/:site.manageUsers.html',
        requiredPermission: 'siteAdminUsers'
    });
    actionsRegistry.add('tags', routerAction, {
        buttonLabel: t('content-media-manager:label.contentManager.leftMenu.manage.tags.title'),
        target: ['leftMenuManageActions:50'],
        buttonIcon: <TagMultiple/>,
        mode: 'apps',
        iframeUrl: ':context/cms/:frame/:workspace/:lang/sites/:site.tagsManager.html',
        requiredPermission: 'tagManager'
    });
    actionsRegistry.add('openInEditMode', openInEditModeAction, {
        buttonLabel: t('content-media-manager:label.contentManager.actions.openInEditMode'),
        buttonIcon: <Edit/>,
        target: ['contentActions'],
        hideForPaths: [PATH_FILES_AND_DESCENDANTS, PATH_CONTENTS_AND_DESCENDANTS, PATH_SYSTEM_SITE_AND_DESCENDANTS]
    });
    actionsRegistry.add('locate', locateAction, {
        buttonLabel: t('content-media-manager:label.contentManager.actions.locate'),
        buttonIcon: <FindInPage/>,
        target: ['contentActions:0.5']
    });
    actionsRegistry.add('subContents', subContentsAction, {
        buttonIcon: <SubdirectoryArrowRight/>,
        buttonLabel: t('content-media-manager:label.contentManager.subContentsAction'),
        target: ['contentActions:0.1'],
        hideOnNodeTypes: ['jnt:virtualsite']
    });
    actionsRegistry.add('export', exportAction, {
        buttonIcon: <ApplicationExport/>,
        buttonLabel: t('content-media-manager:label.contentManager.export.actionLabel'),
        target: ['contentActions:4.2'],
        showOnNodeTypes: ['jnt:page', 'jnt:contentFolder', 'jnt:content']
    });
    actionsRegistry.add('import', fileUploadAction, {
        buttonIcon: <ApplicationImport/>,
        buttonLabel: t('content-media-manager:label.contentManager.import.action'),
        target: ['contentActions:4.3', 'createMenuActions:3.5'],
        showOnNodeTypes: ['jnt:contentFolder'],
        requiredPermission: 'jcr:addChildNodes',
        uploadType: 'import'
    });
    actionsRegistry.add('editImage', routerAction, {
        buttonIcon: <Edit/>,
        buttonLabel: t('content-media-manager:label.contentManager.editImage.action'),
        target: ['contentActions:2.5'],
        requiredPermission: 'jcr:write',
        showOnNodeTypes: ['jmix:image'],
        mode: 'image-edit'
    });
    actionsRegistry.add('downloadFile', downloadFileAction, {
        buttonIcon: <CloudDownload/>,
        buttonLabel: t('content-media-manager:label.contentManager.contentPreview.download'),
        showOnNodeTypes: ['jnt:file'],
        target: ['contentActions:3.7']
    });
    actionsRegistry.add('replaceFile', fileUploadAction, {
        buttonIcon: <Autorenew/>,
        buttonLabel: t('content-media-manager:label.contentManager.fileUpload.replaceWith'),
        target: ['contentActions:0.2'],
        showOnNodeTypes: ['jnt:file'],
        uploadType: 'replaceWith'
    });
    actionsRegistry.add('zip', zipAction, {
        buttonIcon: <ZipIcon/>,
        buttonLabel: t('content-media-manager:label.contentManager.zipUnzip.zip'),
        target: ['contentActions:2.1', 'selectedContentActions'],
        showOnNodeTypes: ['jnt:file', 'jnt:folder'],
        hideForPaths: [PATH_FILES_ITSELF]
    });
    actionsRegistry.add('unzip', unzipAction, {
        buttonIcon: <UnzipIcon/>,
        buttonLabel: t('content-media-manager:label.contentManager.zipUnzip.unzip'),
        target: ['contentActions:2.2'],
        showOnNodeTypes: ['jnt:file'],
        hideForPaths: [PATH_FILES_ITSELF]
    });
}

export default contentManagerActions;
