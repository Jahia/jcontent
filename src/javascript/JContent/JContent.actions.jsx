import React from 'react';
import {menuAction} from '@jahia/ui-extender';

import {
    AddFolder,
    Archive,
    ChevronDown,
    ClearPaste,
    Cloud,
    CloudDownload,
    CloudUpload,
    Copy,
    Cut,
    Delete,
    Download,
    Edit,
    FileZip,
    Lock,
    MoreVert,
    NoCloud,
    OpenInBrowser,
    OpenInNew,
    Paste,
    Publish,
    Reload,
    Replay,
    Search,
    Separator,
    Subdirectory,
    Undelete,
    Unlock,
    Upload,
    Visibility,
    SwapHoriz
} from '@jahia/moonstone';
import {
    ClearAllLocksActionComponent,
    ClearClipboardActionComponent,
    CopyCutActionComponent,
    CreateFolderActionComponent,
    DeleteActionComponent,
    DeletePermanentlyActionComponent,
    DownloadAsZipActionComponent,
    DownloadFileActionComponent,
    EditImageActionComponent,
    ExportActionComponent,
    FileUploadActionComponent,
    LocateActionComponent,
    LockActionComponent,
    OpenInJContentActionComponent,
    OpenInLiveActionComponent,
    OpenInPreviewActionComponent,
    PasteActionComponent,
    PreviewActionComponent,
    PublishActionComponent,
    PublishDeletionActionComponent,
    RenameActionComponent,
    SearchActionComponent,
    SubContentsActionComponent,
    UndeleteActionComponent,
    UnlockActionComponent,
    UnzipActionComponent,
    ZipActionComponent,
    CompareHtmlActionComponent,
    FlushCacheActionComponent
} from '~/JContent/actions';
import {SelectionActionComponent} from './actions/selectionAction';
import {MenuItemRenderer} from './MenuItemRenderer';
import {MenuRenderer} from './MenuRenderer';
import {triggerRefetchAll} from './JContent.refetches';
import {
    ACTION_PERMISSIONS,
    PATH_CATEGORIES_ITSELF,
    PATH_CONTENTS_ITSELF,
    PATH_FILES_ITSELF
} from './actions/actions.constants';
import {ViewUsagesComponent} from '~/JContent/actions/viewUsages';
import {OpenInPageBuilderActionComponent} from '~/JContent/actions/openInPageBuilderAction';
import {CopyMenuComponent} from '~/JContent/actions/copyPaste/CopyMenuComponent';
import {OpenInRepositoryExplorerActionComponent} from '~/JContent/actions/openInRepositoryExplorerAction';
import {CustomizedPreviewActionComponent} from '~/JContent/actions/customizedPreviewAction/customizedPreviewAction';

export const jContentActions = registry => {
    const menuActionWithRenderer = registry.add('action', 'menuAction', menuAction, {
        buttonIconEnd: <ChevronDown/>,
        menuRenderer: MenuRenderer,
        menuItemRenderer: MenuItemRenderer
    });
    registry.add('action', 'preview', {
        buttonIcon: <Visibility/>,
        buttonLabel: 'jcontent:label.contentManager.contentPreview.preview',
        targets: ['contentActions:1', 'accordionContentActions:1'],
        component: PreviewActionComponent
    });
    registry.add('action', 'createContentFolder', {
        buttonIcon: <AddFolder/>,
        buttonLabel: 'jcontent:label.contentManager.create.contentFolder',
        targets: ['createMenuActions:3', 'contentActions:2', 'accordionContentActions:2', 'headerPrimaryActions:2', 'narrowHeaderMenu:2'],
        createFolderType: 'contentFolder',
        component: CreateFolderActionComponent
    });
    registry.add('action', 'rename', {
        buttonIcon: <Edit/>,
        buttonLabel: 'jcontent:label.contentManager.rename',
        targets: ['contentActions:2', 'accordionContentActions:2', 'narrowHeaderMenu:12'],
        component: RenameActionComponent
    });
    registry.add('action', 'createFolder', {
        buttonIcon: <AddFolder/>,
        buttonLabel: 'jcontent:label.contentManager.create.folder',
        targets: ['createMenuActions:3', 'contentActions:3', 'accordionContentActions:3', 'headerPrimaryActions:2.5', 'narrowHeaderMenu:2.5'],
        createFolderType: 'folder',
        component: CreateFolderActionComponent
    });
    registry.add('action', 'refresh', {
        buttonIcon: <Reload/>,
        buttonLabel: 'jcontent:label.contentManager.refresh',
        targets: ['headerPrimaryActions:15', 'narrowHeaderMenu:5'],
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
        targets: ['createMenuActions:4', 'contentActions:4', 'accordionContentActions:4', 'headerPrimaryActions:3', 'narrowHeaderMenu:2.3'],
        uploadType: 'fileUpload',
        component: FileUploadActionComponent
    });
    registry.add('action', 'publishMenu', menuActionWithRenderer, {
        buttonIcon: <Cloud/>,
        buttonLabel: 'jcontent:label.contentManager.contentPreview.publishMenu',
        targets: ['contentActions:6', 'accordionContentActions:6', 'selectedContentActions:1'],
        menuTarget: 'publishMenu',
        hideOnNodeTypes: ['jnt:category'],
        isMenuPreload: true
    });
    registry.add('action', 'publish', {
        buttonIcon: <CloudUpload/>,
        buttonLabel: 'jcontent:label.contentManager.contentPreview.publish',
        buttonLabelShort: 'jcontent:label.contentManager.contentPreview.publishShort',
        targets: ['publishMenu:1', 'narrowHeaderSelectionMenu:11'],
        publishType: 'publish',
        isPublishingAllLanguages: false,
        component: PublishActionComponent
    });
    registry.add('action', 'publishInAllLanguages', {
        buttonIcon: <CloudUpload/>,
        buttonLabel: 'jcontent:label.contentManager.contentPreview.publishInAllLanguages',
        targets: ['publishMenu:2', 'narrowHeaderSelectionMenu:12'],
        publishType: 'publish',
        isPublishingAllLanguages: true,
        component: PublishActionComponent
    });
    registry.add('action', 'publishAll', {
        buttonIcon: <CloudUpload/>,
        buttonLabel: 'jcontent:label.contentManager.contentPreview.publishAll',
        buttonLabelShort: 'jcontent:label.contentManager.contentPreview.publishShort',
        targets: ['publishMenu:3', 'narrowHeaderSelectionMenu:13'],
        publishType: 'publishAll',
        isPublishingAllLanguages: false,
        component: PublishActionComponent
    });
    registry.add('action', 'publishAllInAllLanguages', {
        buttonIcon: <CloudUpload/>,
        buttonLabel: 'jcontent:label.contentManager.contentPreview.publishAllInAllLanguages',
        targets: ['publishMenu:4', 'narrowHeaderSelectionMenu:14'],
        publishType: 'publishAll',
        isPublishingAllLanguages: true,
        component: PublishActionComponent
    });
    registry.add('action', 'publishDeletion', {
        buttonIcon: <Delete/>,
        buttonLabel: 'jcontent:label.contentManager.contentPreview.publishDeletion',
        targets: ['contentActions:4', 'accordionContentActions:4', 'selectedContentActions:4', 'narrowHeaderSelectionMenu:14', 'narrowHeaderMenu:14'],
        component: PublishDeletionActionComponent
    });
    registry.add('action', 'unpublish', {
        buttonIcon: <NoCloud/>,
        buttonLabel: 'jcontent:label.contentManager.contentPreview.unpublish',
        targets: ['publishMenu:5', 'narrowHeaderSelectionMenu:15'],
        publishType: 'unpublish',
        isPublishingAllLanguages: false,
        component: PublishActionComponent
    });
    registry.add('action', 'unpublishInAllLanguages', {
        buttonIcon: <NoCloud/>,
        buttonLabel: 'jcontent:label.contentManager.contentPreview.unpublishInAllLanguages',
        targets: ['publishMenu:6', 'narrowHeaderSelectionMenu:16'],
        publishType: 'unpublish',
        isPublishingAllLanguages: true,
        component: PublishActionComponent
    });
    registry.add('action', 'contentMenu', menuActionWithRenderer, {
        buttonIcon: <MoreVert/>,
        buttonLabel: 'jcontent:label.contentManager.contentPreview.moreOptions',
        menuTarget: 'contentActions',
        menuItemProps: {
            isShowIcons: true
        }
    });
    registry.add('action', 'accordionContentMenu', menuActionWithRenderer, {
        buttonIcon: <MoreVert/>,
        buttonLabel: 'jcontent:label.contentManager.contentPreview.moreOptions',
        menuTarget: 'accordionContentActions',
        menuItemProps: {
            isShowIcons: true
        }
    });
    registry.add('action', 'rootContentMenu', menuActionWithRenderer, {
        buttonIcon: <MoreVert/>,
        buttonLabel: 'jcontent:label.contentManager.contentPreview.moreOptions',
        menuTarget: 'rootContentActions',
        menuItemProps: {
            isShowIcons: true
        }
    });

    registry.add('action', 'selectedContentMenu', menuActionWithRenderer, {
        buttonIcon: <MoreVert/>,
        buttonLabel: 'jcontent:label.contentManager.contentPreview.moreOptions',
        menuTarget: 'selectedContentActions',
        menuEmptyMessage: 'label.contentManager.selection.emptyContextMenu',
        menuItemProps: {
            isShowIcons: true
        }
    });
    registry.add('action', 'notSelectedContentMenu', menuActionWithRenderer, {
        buttonIcon: <MoreVert/>,
        buttonLabel: 'jcontent:label.contentManager.contentPreview.moreOptions',
        menuTarget: 'notSelectedContentMenu',
        menuEmptyMessage: 'label.contentManager.selection.emptyContextMenu',
        menuItemProps: {
            isShowIcons: true
        }
    });
    registry.add('action', 'copy', {
        buttonIcon: <Copy/>,
        buttonLabel: 'jcontent:label.contentManager.copyPaste.copy',
        targets: ['contentActions:3.8', 'accordionContentActions:3.8', 'selectedContentActions:3.8', 'narrowHeaderSelectionMenu:3.8'],
        copyCutType: 'copy',
        hideOnNodeTypes: ['jnt:virtualsite', 'jnt:page', 'jmix:isAreaList'],
        hideForPaths: [PATH_FILES_ITSELF, PATH_CONTENTS_ITSELF, PATH_CATEGORIES_ITSELF],
        component: CopyCutActionComponent
    });
    registry.add('action', 'copyPageMenu', menuActionWithRenderer, {
        buttonIcon: <Copy/>,
        buttonLabel: 'jcontent:label.contentManager.copyPaste.copy',
        menuTarget: 'copyPageMenu',
        targets: ['contentActions:3.8', 'accordionContentActions:3.8', 'selectedContentActions:3.8', 'narrowHeaderSelectionMenu:3.8'],
        showOnNodeTypes: ['jnt:page'],
        component: CopyMenuComponent
    });
    registry.add('action', 'copyPageOnly', {
        buttonIcon: <Copy/>,
        buttonLabel: 'jcontent:label.contentManager.copyPaste.copyPageOnly',
        targets: ['copyPageMenu:1'],
        showOnNodeTypes: ['jnt:page'],
        copyCutType: 'copyPage',
        component: CopyCutActionComponent
    });
    registry.add('action', 'copyPageWithSubPages', {
        buttonIcon: <Copy/>,
        buttonLabel: 'jcontent:label.contentManager.copyPaste.copyPageWithSubPages',
        targets: ['copyPageMenu:2'],
        showOnNodeTypes: ['jnt:page'],
        hideIfHasNoSubPages: true,
        copyCutType: 'copy',
        component: CopyCutActionComponent
    });
    registry.add('action', 'cut', {
        buttonIcon: <Cut/>,
        buttonLabel: 'jcontent:label.contentManager.copyPaste.cut',
        targets: ['contentActions:3.9', 'accordionContentActions:3.9', 'selectedContentActions:3.9', 'narrowHeaderSelectionMenu:3.9'],
        copyCutType: 'cut',
        hideOnNodeTypes: ['jnt:virtualsite', 'jmix:hideDeleteAction', 'jmix:isAreaList'],
        hideForPaths: [PATH_FILES_ITSELF, PATH_CONTENTS_ITSELF, PATH_CATEGORIES_ITSELF],
        component: CopyCutActionComponent
    });
    registry.add('action', 'paste', {
        buttonIcon: <Paste/>,
        buttonLabel: 'jcontent:label.contentManager.copyPaste.paste',
        targets: ['headerPrimaryActions:10', 'contentActions:3.91', 'accordionContentActions:3.91', 'rootContentActions:3.91', 'narrowHeaderMenu:4'],
        component: PasteActionComponent
    });
    registry.add('action', 'pasteReference', {
        buttonIcon: <Paste/>,
        buttonLabel: 'jcontent:label.contentManager.copyPaste.pasteReference',
        hideOnNodeTypes: ['jnt:page', 'jnt:navMenuText', 'jnt:category'],
        referenceTypes: ['jnt:contentReference'],
        targets: ['headerPrimaryActions:10.1', 'contentActions:3.92', 'accordionContentActions:3.92'],
        component: PasteActionComponent
    });
    registry.add('action', 'delete', {
        buttonIcon: <Delete/>,
        buttonLabel: 'jcontent:label.contentManager.contentPreview.delete',
        targets: ['contentActions:4', 'accordionContentActions:4', 'selectedContentActions:4', 'narrowHeaderMenu:12', 'narrowHeaderSelectionMenu:4'],
        hideOnNodeTypes: ['jnt:virtualsite', 'jmix:hideDeleteAction', 'jmix:isAreaList'],
        component: DeleteActionComponent
    });
    registry.add('action', 'deletePermanently', {
        buttonIcon: <Delete/>,
        buttonLabel: 'jcontent:label.contentManager.contentPreview.deletePermanently',
        targets: ['contentActions:4', 'accordionContentActions:4', 'selectedContentActions:4', 'narrowHeaderMenu:12', 'narrowHeaderSelectionMenu:4'],
        component: DeletePermanentlyActionComponent
    });
    registry.add('action', 'undelete', {
        buttonIcon: <Undelete/>,
        buttonLabel: 'jcontent:label.contentManager.contentPreview.undelete',
        targets: ['contentActions:4.1', 'accordionContentActions:4.1', 'selectedContentActions:4.1', 'narrowHeaderMenu:12', 'narrowHeaderSelectionMenu:4'],
        component: UndeleteActionComponent
    });
    registry.add('action', 'lock', {
        buttonLabel: 'jcontent:label.contentManager.contextMenu.lockActions.lock',
        targets: ['contentActions:5', 'accordionContentActions:5', 'narrowHeaderMenu:14'],
        buttonIcon: <Lock/>,
        component: LockActionComponent
    });
    registry.add('action', 'unlock', {
        buttonLabel: 'jcontent:label.contentManager.contextMenu.lockActions.unlock',
        targets: ['contentActions:5', 'accordionContentActions:5', 'narrowHeaderMenu:14'],
        buttonIcon: <Unlock/>,
        component: UnlockActionComponent
    });
    registry.add('action', 'clearAllLocks', {
        buttonIcon: <Lock/>,
        buttonLabel: 'jcontent:label.contentManager.contextMenu.lockActions.clearAllLocks',
        targets: ['contentActions:5.5', 'accordionContentActions:5.5', 'narrowHeaderMenu:14'],
        component: ClearAllLocksActionComponent
    });
    registry.add('action', 'locate', {
        buttonLabel: 'jcontent:label.contentManager.actions.locate',
        buttonIcon: <Search/>,
        targets: ['contentActions:0.5', 'accordionContentActions:0.5', 'narrowHeaderMenu:10.5'],
        component: LocateActionComponent
    });
    registry.add('action', 'subContents', {
        buttonIcon: <Subdirectory/>,
        buttonLabel: 'jcontent:label.contentManager.subContentsAction',
        targets: ['contentActions:15'],
        component: SubContentsActionComponent
    });
    registry.add('action', 'exportPage', {
        buttonIcon: <Upload/>,
        buttonLabel: 'jcontent:label.contentManager.export.actionLabel',
        targets: ['contentActions:4.2', 'accordionContentActions:4.2', 'narrowHeaderMenu:13'],
        showOnNodeTypes: ['jnt:page'],
        requiredSitePermission: [ACTION_PERMISSIONS.exportPageAction],
        component: ExportActionComponent
    });
    registry.add('action', 'export', {
        buttonIcon: <Upload/>,
        buttonLabel: 'jcontent:label.contentManager.export.actionLabel',
        targets: ['contentActions:4.2', 'accordionContentActions:4.2', 'narrowHeaderMenu:13', 'selectedContentActions:2'],
        showOnNodeTypes: ['jnt:contentFolder', 'jnt:content', 'jnt:category'],
        requiredSitePermission: [ACTION_PERMISSIONS.exportAction],
        component: ExportActionComponent
    });
    registry.add('action', 'downloadAsZip', {
        buttonIcon: <Archive/>,
        buttonLabel: 'jcontent:label.contentManager.downloadAsZip',
        buttonLabelShort: 'jcontent:label.contentManager.downloadFile.download',
        targets: ['contentActions:4.21', 'accordionContentActions:4.21', 'selectedContentActions', 'narrowHeaderMenu:14', 'narrowHeaderSelectionMenu:1'],
        showOnNodeTypes: ['jnt:file', 'jnt:folder'],
        component: DownloadAsZipActionComponent
    });
    registry.add('action', 'import', {
        buttonIcon: <Download/>,
        buttonLabel: 'jcontent:label.contentManager.import.action',
        targets: ['contentActions:4.3', 'accordionContentActions:4.3', 'createMenuActions:3.5', 'narrowHeaderMenu:4', 'narrowHeaderSelectionMenu:4', 'headerPrimaryActions:4'],
        uploadType: 'import',
        component: FileUploadActionComponent
    });
    registry.add('action', 'editImage', {
        buttonIcon: <Edit/>,
        buttonLabel: 'jcontent:label.contentManager.editImage.action',
        targets: ['contentActions:2.5', 'accordionContentActions:2.5', 'narrowHeaderMenu:12.5'],
        component: EditImageActionComponent
    });
    registry.add('action', 'downloadFile', {
        buttonIcon: <CloudDownload/>,
        buttonLabel: 'jcontent:label.contentManager.contentPreview.download',
        targets: ['contentActions:3.7', 'accordionContentActions:3.7', 'narrowHeaderMenu:13.7'],
        component: DownloadFileActionComponent
    });
    registry.add('action', 'replaceFile', {
        buttonIcon: <Reload/>,
        buttonLabel: 'jcontent:label.contentManager.fileUpload.replaceWith',
        targets: ['contentActions:0.2', 'accordionContentActions:0.2', 'narrowHeaderMenu:10.2'],
        uploadType: 'replaceWith',
        component: FileUploadActionComponent
    });
    registry.add('action', 'zip', {
        buttonIcon: <FileZip/>,
        buttonLabel: 'jcontent:label.contentManager.zipUnzip.zip',
        targets: ['contentActions:2.1', 'accordionContentActions:2.1', 'selectedContentActions', 'narrowHeaderSelectionMenu:0.5', 'narrowHeaderMenu:12'],
        component: ZipActionComponent
    });
    registry.add('action', 'unzip', {
        buttonIcon: <FileZip/>,
        buttonLabel: 'jcontent:label.contentManager.zipUnzip.unzip',
        targets: ['contentActions:2.2', 'accordionContentActions:2.2', 'narrowHeaderMenu:12.2'],
        component: UnzipActionComponent
    });
    registry.add('action', 'search', {
        buttonIcon: <Search/>,
        buttonLabel: 'jcontent:label.contentManager.search.search',
        targets: [],
        component: SearchActionComponent
    });
    registry.add('action', 'openInJContent', {
        buttonIcon: <OpenInBrowser/>,
        buttonLabel: 'jcontent:label.contentManager.actions.openInJContent',
        targets: [],
        component: OpenInJContentActionComponent
    });
    registry.add('action', 'openInPageBuilder', {
        buttonIcon: <OpenInBrowser/>,
        buttonLabel: 'jcontent:label.contentManager.actions.openInPageBuilder',
        targets: ['contentActions:2.2', 'accordionContentActions:2.2', 'narrowHeaderMenu:12.2'],
        component: OpenInPageBuilderActionComponent
    });

    registry.add('action', 'openInLive', {
        buttonIcon: <OpenInNew/>,
        buttonLabel: 'jcontent:label.contentManager.actions.openInLive',
        targets: [],
        component: OpenInLiveActionComponent
    });

    registry.add('action', 'openInPreviewMenu', menuActionWithRenderer, {
        buttonLabel: 'jcontent:label.contentManager.contentPreview.preview',
        menuTarget: 'openInPreviewMenu',
        showOnNodeTypes: ['jnt:page'],
        isMenuPreload: true,
        menuItemProps: {
            isShowIcons: true
        }
    });

    registry.add('action', 'openInPreview', {
        buttonIcon: <Visibility/>,
        buttonLabel: 'jcontent:label.contentManager.actions.openInPreview',
        targets: [],
        component: OpenInPreviewActionComponent
    });

    registry.add('action', 'customizedPreview', {
        buttonIcon: <Visibility/>,
        buttonLabel: 'jcontent:label.contentManager.actions.customizedPreview.label',
        targets: ['openInPreviewMenu:1'],
        component: CustomizedPreviewActionComponent
    });

    registry.add('action', 'compareStagingToLive', {
        buttonIcon: <SwapHoriz/>,
        buttonLabel: 'jcontent:label.contentManager.actions.compareStagingToLive',
        targets: ['openInPreviewMenu:2'],
        component: CompareHtmlActionComponent
    });

    registry.add('action', 'openInRepositoryExplorer', {
        buttonIcon: <OpenInBrowser/>,
        buttonLabel: 'jcontent:label.contentManager.actions.openInRepositoryExplorer',
        targets: ['contentActions:2.3', 'accordionContentActions:2.3'],
        component: OpenInRepositoryExplorerActionComponent
    });

    registry.add('action', 'contentActionsSeparator1', {
        targets: ['contentActions:0', 'accordionContentActions:0', 'rootContentActions:0'],
        isSeparator: true
    });

    registry.add('action', 'contentActionsSeparator2', {
        targets: ['contentActions:10', 'accordionContentActions:10', 'narrowHeaderMenu:10'],
        isSeparator: true
    });

    registry.add('action', 'clearClipboard', {
        buttonIcon: <ClearPaste/>,
        buttonLabel: 'jcontent:label.contentManager.copyPaste.clear',
        targets: ['headerPrimaryActions:14', 'narrowHeaderMenu:14'],
        component: ClearClipboardActionComponent
    });

    /* Narrow header menu actions */

    registry.add('action', 'narrowHeaderMenu', menuActionWithRenderer, {
        buttonLabel: 'jcontent:label.contentManager.actions.menuLabel.actions',
        targets: [],
        menuTarget: 'narrowHeaderMenu',
        menuItemProps: {
            isShowIcons: true
        }
    });

    registry.add('action', 'narrowHeaderSelectionMenu', menuActionWithRenderer, {
        buttonLabel: 'jcontent:label.contentManager.actions.menuLabel.actions',
        targets: [],
        menuTarget: 'narrowHeaderSelectionMenu',
        menuItemProps: {
            isShowIcons: true
        },
        isMenuPreload: true,
        visibilityPredicate: menuState => menuState.loadedItems.filter(item => !(item.startsWith('actionsLabel-') || item.startsWith('publicationActionsLabel-'))).length > 0
    });

    registry.add('action', 'actionsLabel', {
        targets: ['narrowHeaderMenu:0', 'narrowHeaderSelectionMenu:0'],
        buttonLabel: 'jcontent:label.contentManager.actions.menuLabel.actions',
        isTitle: true
    });

    registry.add('action', 'moreActionsLabel', {
        targets: ['narrowHeaderMenu:10.5'],
        buttonLabel: 'jcontent:label.contentManager.actions.menuLabel.moreActions',
        isTitle: true
    });

    registry.add('action', 'publicationActionsLabel', {
        targets: ['narrowHeaderSelectionMenu:10.5'],
        buttonLabel: 'jcontent:label.contentManager.actions.menuLabel.publication',
        isTitle: true
    });

    registry.add('action', 'selectionAction', {
        targets: ['notSelectedContentMenu:-10', 'selectedContentActions:-10'],
        component: SelectionActionComponent
    });

    registry.add('action', 'viewUsages', {
        component: ViewUsagesComponent
    });

    registry.add('action', 'flushPageCache', {
        component: FlushCacheActionComponent,
        showOnNodeTypes: ['jnt:page'],
        buttonLabel: 'jcontent:label.cache.flushPageCache',
        targets: ['contentActions:6', 'accordionContentActions:6'],
        buttonIcon: <Replay/>
    });

    registry.add('action', 'flushSiteCache', {
        component: FlushCacheActionComponent,
        showOnNodeTypes: ['jnt:page', 'jnt:virtualsite'],
        buttonLabel: 'jcontent:label.cache.flushSiteCache',
        targets: ['contentActions:6', 'accordionContentActions:6'],
        buttonIcon: <Replay/>
    });
};
