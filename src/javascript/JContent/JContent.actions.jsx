import React from 'react';
import {menuAction} from '@jahia/ui-extender';
import {Autorenew, FindInPage, LockOpen, SubdirectoryArrowRight, Visibility} from '@material-ui/icons';

import {
    AddFolder,
    ChevronDown,
    CloudDownload,
    CloudUpload,
    Copy,
    Delete,
    Edit,
    FileZip,
    Lock,
    MoreVert,
    Paste,
    Publish,
    Reload,
    Search
} from '@jahia/moonstone/dist/icons';

import {ApplicationExport, ApplicationImport, ContentCut, DeleteRestore} from 'mdi-material-ui';
import {FileUploadActionComponent} from './actions/fileUploadAction';
import {DeleteActionComponent} from './actions/deleteAction';
import {UndeleteActionComponent} from './actions/undeleteAction';
import {DeletePermanentlyActionComponent} from './actions/deletePermanentlyAction';
import {PublishActionComponent} from './actions/publishAction';
import {PublishDeletionActionComponent} from './actions/publishDeletionAction';
import {PreviewActionComponent} from './actions/previewAction';
import {PasteActionComponent} from './actions/copyPaste/pasteAction';
import {CopyCutActionComponent} from './actions/copyPaste/CopyCutActionComponent';
import {LockActionComponent} from './actions/lockAction';
import {RouterActionComponent} from './actions/routerAction';
import {UnlockActionComponent} from './actions/unlockAction';
import {ClearAllLocksActionComponent} from './actions/clearAllLocksAction';
import {LocateActionComponent} from './actions/locateAction';
import {SubContentsActionComponent} from './actions/subContentsAction';
import {ExportActionComponent} from './actions/exportAction';
import {DownloadFileActionComponent} from './actions/downloadFileAction';
import {CreateFolderActionComponent} from './actions/createFolderAction';
import {ZipActionComponent} from './actions/zipUnzip/zipAction';
import {UnzipActionComponent} from './actions/zipUnzip/unzipAction';
import {SearchActionComponent} from './actions/searchAction';
import {MenuItemRenderer} from './MenuItemRenderer';
import {MenuRenderer} from './MenuRenderer';
import {Separator} from '@jahia/moonstone';
import {triggerRefetchAll} from './JContent.refetches';

const PATH_CONTENTS_ITSELF = '^/sites/((?!/).)+/contents/?$';
const PATH_CONTENTS_DESCENDANTS = '^/sites/((?!/).)+/contents/.+';

const PATH_FILES_ITSELF = '^/sites/((?!/).)+/files/?$';
const PATH_FILES_DESCENDANTS = '^/sites/((?!/).)+/files/.+';

export const jContentActions = registry => {
    const menuActionWithRenderer = registry.add('action', 'menuAction', menuAction, {
        buttonIcon: <ChevronDown/>,
        menuRenderer: MenuRenderer,
        menuItemRenderer: MenuItemRenderer
    });
    registry.add('action', 'preview', {
        buttonIcon: <Visibility/>,
        buttonLabel: 'jcontent:label.contentManager.contentPreview.preview',
        hideOnNodeTypes: ['jnt:page', 'jnt:virtualsite'],
        targets: ['contentActions:1'],
        component: PreviewActionComponent
    });
    registry.add('action', 'createContentFolder', {
        buttonIcon: <AddFolder/>,
        buttonLabel: 'jcontent:label.contentManager.create.contentFolder',
        targets: ['createMenuActions:3', 'contentActions:2', 'headerPrimaryActions:2'],
        contentType: 'jnt:contentFolder',
        showOnNodeTypes: ['jnt:contentFolder'],
        component: CreateFolderActionComponent
    });
    registry.add('action', 'createFolder', {
        buttonIcon: <AddFolder/>,
        buttonLabel: 'jcontent:label.contentManager.create.folder',
        targets: ['createMenuActions:3', 'contentActions:3', 'headerPrimaryActions:2.5'],
        contentType: 'jnt:folder',
        showOnNodeTypes: ['jnt:folder'],
        component: CreateFolderActionComponent
    });
    registry.add('action', 'refresh', {
        buttonIcon: <Reload/>,
        buttonLabel: 'jcontent:label.contentManager.refresh',
        targets: ['headerPrimaryActions:15'],
        onClick: () => {
            triggerRefetchAll();
        }
    });
    registry.add('action', 'separator', {
        component: () => <Separator variant="vertical" invisible="firstOrLastChild"/>,
        targets: ['headerPrimaryActions:20']
    });
    registry.add('action', 'fileUpload', {
        buttonIcon: <Publish/>,
        buttonLabel: 'jcontent:label.contentManager.fileUpload.uploadButtonLabel',
        targets: ['createMenuActions:4', 'contentActions:4', 'headerPrimaryActions:3'],
        contentType: 'jnt:file',
        showOnNodeTypes: ['jnt:folder'],
        requiredPermission: 'jcr:addChildNodes',
        component: FileUploadActionComponent
    });
    registry.add('action', 'publish', {
        buttonIcon: <CloudUpload/>,
        buttonLabel: 'jcontent:label.contentManager.contentPreview.publish',
        buttonLabelShort: 'jcontent:label.contentManager.contentPreview.publishShort',
        buttonLabelMultiple: 'jcontent:label.contentManager.contentPreview.MultipleSelectionPublishMenu',
        targets: ['publishMenu:1'],
        allSubtree: false,
        allLanguages: false,
        checkForUnpublication: false,
        checkIfLanguagesMoreThanOne: false,
        hideOnNodeTypes: ['jnt:virtualsite', 'jnt:contentFolder', 'nt:folder'],
        component: PublishActionComponent
    });
    registry.add('action', 'publishMenu', menuActionWithRenderer, {
        buttonLabel: 'jcontent:label.contentManager.contentPreview.publishMenu',
        targets: ['contentActions:6', 'selectedContentActions:1'],
        menuTarget: 'publishMenu',
        menuPreload: true
    });
    registry.add('action', 'publishInAllLanguages', {
        buttonIcon: <CloudUpload/>,
        buttonLabel: 'jcontent:label.contentManager.contentPreview.publishInAllLanguages',
        targets: ['publishMenu:2'],
        allSubTree: false,
        allLanguages: true,
        checkForUnpublication: false,
        checkIfLanguagesMoreThanOne: true,
        hideOnNodeTypes: ['jnt:virtualsite', 'jnt:contentFolder', 'nt:folder'],
        component: PublishActionComponent
    });
    registry.add('action', 'publishAll', {
        buttonIcon: <CloudUpload/>,
        buttonLabel: 'jcontent:label.contentManager.contentPreview.publishAll',
        buttonLabelShort: 'jcontent:label.contentManager.contentPreview.publishShort',
        targets: ['publishMenu:3'],
        showOnNodeTypes: ['jnt:folder', 'jnt:contentFolder', 'jnt:page'],
        allSubTree: true,
        allLanguages: false,
        checkForUnpublication: false,
        checkIfLanguagesMoreThanOne: false,
        component: PublishActionComponent
    });
    registry.add('action', 'publishAllInAllLanguages', {
        buttonIcon: <CloudUpload/>,
        buttonLabel: 'jcontent:label.contentManager.contentPreview.publishAllInAllLanguages',
        targets: ['publishMenu:4'],
        showOnNodeTypes: ['jnt:folder', 'jnt:contentFolder', 'jnt:page'],
        allSubTree: true,
        allLanguages: true,
        checkForUnpublication: false,
        checkIfLanguagesMoreThanOne: true,
        component: PublishActionComponent
    });
    registry.add('action', 'publishDeletion', {
        buttonIcon: <Delete/>,
        buttonLabel: 'jcontent:label.contentManager.contentPreview.publishDeletion',
        targets: ['contentActions:4', 'selectedContentActions:4'],
        hideOnNodeTypes: ['jnt:virtualsite', 'jnt:page'],
        component: PublishDeletionActionComponent
    });
    registry.add('action', 'unpublish', {
        buttonIcon: <CloudDownload/>,
        buttonLabel: 'jcontent:label.contentManager.contentPreview.unpublish',
        targets: ['publishMenu:5'],
        hideOnNodeTypes: ['jnt:virtualsite'],
        allSubTree: false,
        allLanguages: false,
        checkForUnpublication: true,
        checkIfLanguagesMoreThanOne: false,
        component: PublishActionComponent
    });
    registry.add('action', 'unpublishInAllLanguages', {
        buttonIcon: <CloudDownload/>,
        buttonLabel: 'jcontent:label.contentManager.contentPreview.unpublishInAllLanguages',
        targets: ['publishMenu:6'],
        hideOnNodeTypes: ['jnt:virtualsite'],
        allSubTree: false,
        allLanguages: true,
        checkForUnpublication: true,
        checkIfLanguagesMoreThanOne: true,
        component: PublishActionComponent
    });
    registry.add('action', 'contentMenu', menuActionWithRenderer, {
        buttonIcon: <MoreVert/>,
        buttonLabel: 'jcontent:label.contentManager.contentPreview.moreOptions',
        menuTarget: 'contentActions',
        showIcons: true
    });
    registry.add('action', 'selectedContentMenu', menuActionWithRenderer, {
        buttonIcon: <MoreVert/>,
        buttonLabel: 'jcontent:label.contentManager.contentPreview.moreOptions',
        menuTarget: 'selectedContentActions',
        menuEmptyMessage: 'label.contentManager.selection.emptyContextMenu',
        showIcons: true
    });
    registry.add('action', 'copy', {
        buttonIcon: <Copy/>,
        buttonLabel: 'jcontent:label.contentManager.contentPreview.copy',
        targets: ['contentActions:3.8', 'selectedContentActions:3.8'],
        hideOnNodeTypes: ['jnt:virtualsite', 'jnt:page'],
        hideForPaths: [PATH_FILES_ITSELF, PATH_CONTENTS_ITSELF],
        component: CopyCutActionComponent
    });
    registry.add('action', 'paste', {
        buttonIcon: <Paste/>,
        buttonLabel: 'jcontent:label.contentManager.contentPreview.paste',
        targets: ['headerPrimaryActions:10', 'contentActions:3.91'],
        hideOnNodeTypes: ['jnt:page'],
        component: PasteActionComponent
    });
    registry.add('action', 'cut', {
        buttonIcon: <ContentCut/>,
        buttonLabel: 'jcontent:label.contentManager.contentPreview.cut',
        targets: ['contentActions:3.9', 'selectedContentActions:3.9'],
        hideOnNodeTypes: ['jnt:page'],
        showForPaths: [PATH_FILES_DESCENDANTS, PATH_CONTENTS_DESCENDANTS],
        copyCutType: 'cut',
        component: CopyCutActionComponent
    });
    registry.add('action', 'delete', {
        buttonIcon: <Delete/>,
        buttonLabel: 'jcontent:label.contentManager.contentPreview.delete',
        targets: ['contentActions:4', 'selectedContentActions:4'],
        hideOnNodeTypes: ['jnt:virtualsite', 'jnt:page'],
        hideForPaths: [PATH_FILES_ITSELF, PATH_CONTENTS_ITSELF],
        component: DeleteActionComponent
    });
    registry.add('action', 'deletePermanently', {
        buttonIcon: <Delete/>,
        buttonLabel: 'jcontent:label.contentManager.contentPreview.deletePermanently',
        targets: ['contentActions:4', 'selectedContentActions:4'],
        hideOnNodeTypes: ['jnt:virtualsite', 'jnt:page'],
        hideForPaths: [PATH_FILES_ITSELF, PATH_CONTENTS_ITSELF],
        component: DeletePermanentlyActionComponent
    });
    registry.add('action', 'undelete', {
        buttonIcon: <DeleteRestore/>,
        buttonLabel: 'jcontent:label.contentManager.contentPreview.undelete',
        targets: ['contentActions:4.1', 'selectedContentActions:4.1'],
        hideOnNodeTypes: ['jnt:virtualsite', 'jnt:page'],
        hideForPaths: [PATH_FILES_ITSELF, PATH_CONTENTS_ITSELF],
        component: UndeleteActionComponent
    });
    registry.add('action', 'lock', {
        buttonLabel: 'jcontent:label.contentManager.contextMenu.lockActions.lock',
        targets: ['contentActions:5'],
        hideOnNodeTypes: ['jnt:page'],
        buttonIcon: <Lock/>,
        component: LockActionComponent
    });
    registry.add('action', 'unlock', {
        buttonLabel: 'jcontent:label.contentManager.contextMenu.lockActions.unlock',
        targets: ['contentActions:5'],
        hideOnNodeTypes: ['jnt:page'],
        buttonIcon: <LockOpen/>,
        component: UnlockActionComponent
    });
    registry.add('action', 'clearAllLocks', {
        buttonIcon: <Lock/>,
        buttonLabel: 'jcontent:label.contentManager.contextMenu.lockActions.clearAllLocks',
        targets: ['contentActions:5.5'],
        hideOnNodeTypes: ['jnt:page'],
        component: ClearAllLocksActionComponent
    });
    registry.add('action', 'locate', {
        buttonLabel: 'jcontent:label.contentManager.actions.locate',
        buttonIcon: <FindInPage/>,
        targets: ['contentActions:0.5'],
        component: LocateActionComponent
    });
    registry.add('action', 'subContents', {
        buttonIcon: <SubdirectoryArrowRight/>,
        buttonLabel: 'jcontent:label.contentManager.subContentsAction',
        targets: ['contentActions:0.1'],
        hideOnNodeTypes: ['jnt:virtualsite'],
        component: SubContentsActionComponent
    });
    registry.add('action', 'export', {
        buttonIcon: <ApplicationExport/>,
        buttonLabel: 'jcontent:label.contentManager.export.actionLabel',
        targets: ['contentActions:4.2'],
        showOnNodeTypes: ['jnt:page', 'jnt:contentFolder', 'jnt:content'],
        component: ExportActionComponent
    });
    registry.add('action', 'import', {
        buttonIcon: <ApplicationImport/>,
        buttonLabel: 'jcontent:label.contentManager.import.action',
        targets: ['contentActions:4.3', 'createMenuActions:3.5'],
        showOnNodeTypes: ['jnt:contentFolder'],
        requiredPermission: 'jcr:addChildNodes',
        uploadType: 'import',
        component: FileUploadActionComponent
    });
    registry.add('action', 'editImage', {
        buttonIcon: <Edit/>,
        buttonLabel: 'jcontent:label.contentManager.editImage.action',
        targets: ['contentActions:2.5'],
        requiredPermission: 'jcr:write',
        showOnNodeTypes: ['jmix:image'],
        mode: 'image-edit',
        component: RouterActionComponent
    });
    registry.add('action', 'downloadFile', {
        buttonIcon: <CloudDownload/>,
        buttonLabel: 'jcontent:label.contentManager.contentPreview.download',
        showOnNodeTypes: ['jnt:file'],
        targets: ['contentActions:3.7'],
        component: DownloadFileActionComponent
    });
    registry.add('action', 'replaceFile', {
        buttonIcon: <Autorenew/>,
        buttonLabel: 'jcontent:label.contentManager.fileUpload.replaceWith',
        targets: ['contentActions:0.2'],
        showOnNodeTypes: ['jnt:file'],
        uploadType: 'replaceWith',
        component: FileUploadActionComponent
    });
    registry.add('action', 'zip', {
        buttonIcon: <FileZip/>,
        buttonLabel: 'jcontent:label.contentManager.zipUnzip.zip',
        targets: ['contentActions:2.1', 'selectedContentActions'],
        showOnNodeTypes: ['jnt:file', 'jnt:folder'],
        hideForPaths: [PATH_FILES_ITSELF],
        component: ZipActionComponent
    });
    registry.add('action', 'unzip', {
        buttonIcon: <FileZip/>,
        buttonLabel: 'jcontent:label.contentManager.zipUnzip.unzip',
        targets: ['contentActions:2.2'],
        showOnNodeTypes: ['jnt:file'],
        hideForPaths: [PATH_FILES_ITSELF],
        component: UnzipActionComponent
    });
    registry.add('action', 'search', {
        buttonIcon: <Search/>,
        buttonLabel: 'jcontent:label.contentManager.search.search',
        targets: [],
        component: SearchActionComponent
    });
};
