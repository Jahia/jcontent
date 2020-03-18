import React from 'react';
import {menuAction} from '@jahia/ui-extender';
import {UnzipIcon, ZipIcon} from './actions/icons';
import {Autorenew, FindInPage, LockOpen, SubdirectoryArrowRight, Visibility} from '@material-ui/icons';

import {
    AddFolder,
    ChevronDown,
    CloudDownload,
    CloudUpload,
    Delete,
    Edit,
    Lock,
    Paste,
    Publish,
    Reload
} from '@jahia/moonstone/dist/icons';

import {
    ApplicationExport,
    ApplicationImport,
    ContentCopy,
    ContentCut,
    DeleteRestore,
    DotsVertical
} from 'mdi-material-ui';
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
import unlockAction from './actions/unlockAction';
import clearAllLocksAction from './actions/clearAllLocksAction';
import locateAction from './actions/locateAction';
import subContentsAction from './actions/subContentsAction';
import exportAction from './actions/exportAction';
import refreshAction from './actions/refreshAction';
import downloadFileAction from './actions/downloadFileAction';
import createFolderAction from './actions/createFolderAction';
import zipAction from './actions/zipUnzip/zipAction';
import unzipAction from './actions/zipUnzip/unzipAction';
import {MenuItemRenderer} from './MenuItemRenderer';
import {MenuRenderer} from './MenuRenderer';
import {Separator} from '@jahia/moonstone';

const PATH_CONTENTS_ITSELF = '^/sites/((?!/).)+/contents/?$';
const PATH_CONTENTS_DESCENDANTS = '^/sites/((?!/).)+/contents/.+';

const PATH_FILES_ITSELF = '^/sites/((?!/).)+/files/?$';
const PATH_FILES_DESCENDANTS = '^/sites/((?!/).)+/files/.+';

export const jContentActions = registry => {
    registry.add('action', 'router', routerAction);

    const menuActionWithRenderer = registry.add('action', 'menuAction', menuAction, {
        buttonIcon: <ChevronDown/>,
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
        buttonIcon: <AddFolder/>,
        buttonLabel: 'jcontent:label.contentManager.create.contentFolder',
        targets: ['createMenuActions:3', 'contentActions:2', 'headerPrimaryActions:2'],
        contentType: 'jnt:contentFolder',
        showOnNodeTypes: ['jnt:contentFolder']
    });
    registry.add('action', 'createFolder', createFolderAction, {
        buttonIcon: <AddFolder/>,
        buttonLabel: 'jcontent:label.contentManager.create.folder',
        targets: ['createMenuActions:3', 'contentActions:3', 'headerPrimaryActions:2.5'],
        contentType: 'jnt:folder',
        showOnNodeTypes: ['jnt:folder']
    });
    registry.add('action', 'refresh', refreshAction, {
        buttonIcon: <Reload/>,
        buttonLabel: 'jcontent:label.contentManager.refresh',
        targets: ['headerPrimaryActions:15']
    });
    registry.add('action', 'separator', createFolderAction, {
        component: () => <Separator variant="vertical" invisible="firstOrLastChild"/>,
        targets: ['headerPrimaryActions:20']
    });
    registry.add('action', 'fileUpload', fileUploadAction, {
        buttonIcon: <Publish/>,
        buttonLabel: 'jcontent:label.contentManager.fileUpload.uploadButtonLabel',
        targets: ['createMenuActions:4', 'contentActions:4', 'headerPrimaryActions:3'],
        contentType: 'jnt:file',
        showOnNodeTypes: ['jnt:folder'],
        requiredPermission: 'jcr:addChildNodes'
    });
    registry.add('action', 'publish', publishAction, {
        buttonIcon: <CloudUpload/>,
        buttonLabel: 'jcontent:label.contentManager.contentPreview.publish',
        buttonLabelShort: 'jcontent:label.contentManager.contentPreview.publishShort',
        targets: ['publishMenu:1'],
        allSubtree: false,
        allLanguages: false,
        checkForUnpublication: false,
        checkIfLanguagesMoreThanOne: false,
        hideOnNodeTypes: ['jnt:virtualsite', 'jnt:contentFolder', 'nt:folder']
    });
    registry.add('action', 'publishMenu', menuActionWithRenderer, {
        buttonLabel: 'jcontent:label.contentManager.contentPreview.publishMenu',
        targets: ['contentActions:6', 'selectedContentActions:5'],
        menuTarget: 'publishMenu',
        menuPreload: true
    });
    registry.add('action', 'publishInAllLanguages', publishAction, {
        buttonIcon: <CloudUpload/>,
        buttonLabel: 'jcontent:label.contentManager.contentPreview.publishInAllLanguages',
        targets: ['publishMenu:2'],
        allSubTree: false,
        allLanguages: true,
        checkForUnpublication: false,
        checkIfLanguagesMoreThanOne: true,
        hideOnNodeTypes: ['jnt:virtualsite', 'jnt:contentFolder', 'nt:folder']
    });
    registry.add('action', 'publishAll', publishAction, {
        buttonIcon: <CloudUpload/>,
        buttonLabel: 'jcontent:label.contentManager.contentPreview.publishAll',
        buttonLabelShort: 'jcontent:label.contentManager.contentPreview.publishShort',
        targets: ['publishMenu:3'],
        showOnNodeTypes: ['jnt:folder', 'jnt:contentFolder', 'jnt:page'],
        allSubTree: true,
        allLanguages: false,
        checkForUnpublication: false,
        checkIfLanguagesMoreThanOne: false
    });
    registry.add('action', 'publishAllInAllLanguages', publishAction, {
        buttonIcon: <CloudUpload/>,
        buttonLabel: 'jcontent:label.contentManager.contentPreview.publishAllInAllLanguages',
        targets: ['publishMenu:4'],
        showOnNodeTypes: ['jnt:folder', 'jnt:contentFolder', 'jnt:page'],
        allSubTree: true,
        allLanguages: true,
        checkForUnpublication: false,
        checkIfLanguagesMoreThanOne: true
    });
    registry.add('action', 'publishDeletion', publishDeletionAction, {
        buttonIcon: <Delete/>,
        buttonLabel: 'jcontent:label.contentManager.contentPreview.publishDeletion',
        targets: ['contentActions:4', 'selectedContentActions:4'],
        hideOnNodeTypes: ['jnt:virtualsite', 'jnt:page']
    });
    registry.add('action', 'unpublish', publishAction, {
        buttonIcon: <CloudDownload/>,
        buttonLabel: 'jcontent:label.contentManager.contentPreview.unpublish',
        targets: ['publishMenu:5'],
        hideOnNodeTypes: ['jnt:virtualsite'],
        allSubTree: false,
        allLanguages: false,
        checkForUnpublication: true,
        checkIfLanguagesMoreThanOne: false
    });
    registry.add('action', 'unpublishInAllLanguages', publishAction, {
        buttonIcon: <CloudDownload/>,
        buttonLabel: 'jcontent:label.contentManager.contentPreview.unpublishInAllLanguages',
        targets: ['publishMenu:6'],
        hideOnNodeTypes: ['jnt:virtualsite'],
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
        buttonIcon: <Paste/>,
        buttonLabel: 'jcontent:label.contentManager.contentPreview.paste',
        targets: ['headerPrimaryActions:10', 'contentActions:3.91'],
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
        buttonIcon: <Delete/>,
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
};
