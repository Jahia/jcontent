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
    PasteAsReference,
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
    const actionTargets = {
        menuAction: [],
        preview: ['contentActions:1'],
        createContentFolder: ['createMenuActions:3', 'contentActions:2', 'headerPrimaryActions:2', 'narrowHeaderMenu:2'],
        rename: ['contentActions:2', 'narrowHeaderMenu:12'],
        createFolder: ['createMenuActions:3', 'contentActions:3', 'accordionContentActions:1', 'headerPrimaryActions:2.5', 'narrowHeaderMenu:2.5'],
        refresh: ['headerPrimaryActions:15', 'narrowHeaderMenu:5'],
        separator: ['headerPrimaryActions:20'],
        fileUpload: ['createMenuActions:4', 'contentActions:4', '--accordionContentActions:4', 'headerPrimaryActions:3', 'narrowHeaderMenu:2.3'],
        publishMenu: ['contentActions:6', 'accordionContentActions:2.3', 'selectedContentActions:1', 'contentItemActions:1.2', 'contentItemContextActions:1.2'],
        publish: ['publishMenu:1', 'narrowHeaderSelectionMenu:11'],
        publishInAllLanguages: ['publishMenu:2', 'narrowHeaderSelectionMenu:12'],
        publishAll: ['publishMenu:3', 'narrowHeaderSelectionMenu:13'],
        publishAllInAllLanguages: ['publishMenu:4', 'narrowHeaderSelectionMenu:14'],
        publishDeletion: ['contentActions:4', 'accordionContentActions:2.3', 'selectedContentActions:4', 'narrowHeaderSelectionMenu:14', 'narrowHeaderMenu:14'],
        unpublish: ['publishMenu:5', 'narrowHeaderSelectionMenu:15'],
        unpublishInAllLanguages: ['publishMenu:6', 'narrowHeaderSelectionMenu:16'],
        contentMenu: [],
        accordionContentMenu: [],
        rootContentMenu: [],
        selectedContentMenu: [],
        notSelectedContentMenu: [],
        copy: ['contentActions:3.8', 'accordionContentActions:3', 'selectedContentActions:3.8', 'narrowHeaderSelectionMenu:3.8', 'contentItemActions:3', 'contentItemContextActions:1.3'],
        copyPageMenu: ['contentActions:3.8', 'accordionContentActions:3', 'selectedContentActions:3.8', 'narrowHeaderSelectionMenu:3.8'],
        copyPageOnly: ['copyPageMenu:1'],
        copyPageWithSubPages: ['copyPageMenu:2'],
        cut: ['contentActions:3.9', 'accordionContentActions:3.1', 'selectedContentActions:3.9', 'narrowHeaderSelectionMenu:3.9', 'contentItemActions:3.1', 'contentItemContextActions:3:1'],
        paste: ['headerPrimaryActions:10', 'contentActions:3.91', 'accordionContentActions:3.2', 'rootContentActions:3.91', 'narrowHeaderMenu:4', 'contentItemActions:3.2', 'contentItemContextActions:3.2'],
        pasteReference: ['headerPrimaryActions:10.1', 'contentActions:3.92', 'accordionContentActions:3.2', 'contentItemActions:3.3', 'contentItemContextActions:3.3'],
        delete: ['contentActions:4', 'accordionContentActions:3.3', 'selectedContentActions:4', 'narrowHeaderMenu:12', 'narrowHeaderSelectionMenu:4', 'contentItemActions:3.4', 'contentItemContextActions:3.4'],
        deletePermanently: ['contentActions:4', 'accordionContentActions:3.3', 'selectedContentActions:4', 'narrowHeaderMenu:12', 'narrowHeaderSelectionMenu:4', 'contentItemActions:3.4', 'contentItemContextActions:3.4'],
        undelete: ['contentActions:4.1', 'accordionContentActions:3.3', 'selectedContentActions:4.1', 'narrowHeaderMenu:12', 'narrowHeaderSelectionMenu:4', 'contentItemActions:3.4', 'contentItemContextActions:3.4'],
        lock: ['contentActions:5', 'accordionContentActions:2.2', 'narrowHeaderMenu:14', 'contentItemActions:1.1', 'visibleContentItemActions:1.1', 'contentItemContextActions:1.1'],
        unlock: ['contentActions:5', '--accordionContentActions:5', 'narrowHeaderMenu:14', 'contentItemActions:1.1', 'visibleContentItemActions:1.1', 'contentItemContextActions:1.1'],
        clearAllLocks: ['contentActions:5.5', '--accordionContentActions:5.5', 'narrowHeaderMenu:14', 'browseControlBar:2'],
        locate: ['contentActions:0.5', '--accordionContentActions:0.5', 'narrowHeaderMenu:10.5'],
        subContents: ['contentActions:15'],
        exportPage: ['contentActions:4.2', '--accordionContentActions:4.2', 'narrowHeaderMenu:13', 'browseControlBar:1.2'],
        export: ['contentActions:4.2', '--accordionContentActions:4.2', 'narrowHeaderMenu:13', 'selectedContentActions:2', 'browseControlBar:1.2', 'contentItemActions:4', 'contentItemContextActions:4'],
        downloadAsZip: ['contentActions:4.21', '--accordionContentActions:4.21', 'selectedContentActions', 'narrowHeaderMenu:14', 'narrowHeaderSelectionMenu:1'],
        import: ['contentActions:4.3', '--accordionContentActions:4.3', 'createMenuActions:3.5', 'narrowHeaderMenu:4', 'narrowHeaderSelectionMenu:4', 'headerPrimaryActions:4', 'browseControlBar:1.1', 'contentItemActions:4', 'contentItemContextActions:4'],
        editImage: ['contentActions:2.5', '--accordionContentActions:2.5', 'narrowHeaderMenu:12.5'],
        downloadFile: ['contentActions:3.7', '--accordionContentActions:3.7', 'narrowHeaderMenu:13.7'],
        replaceFile: ['contentActions:0.2', '--accordionContentActions:0.2', 'narrowHeaderMenu:10.2'],
        zip: ['contentActions:2.1', '--accordionContentActions:2.1', 'selectedContentActions', 'narrowHeaderSelectionMenu:0.5', 'narrowHeaderMenu:12'],
        unzip: ['contentActions:2.2', '--accordionContentActions:2.2', 'narrowHeaderMenu:12.2'],
        search: [],
        openInJContent: [],
        openInPageBuilder: ['contentActions:2.2', '--accordionContentActions:2.2', 'narrowHeaderMenu:12.2'],
        openInLive: [],
        openInPreviewMenu: [],
        openInPreview: [],
        customizedPreview: ['openInPreviewMenu:1'],
        compareStagingToLive: ['openInPreviewMenu:2'],
        openInRepositoryExplorer: ['contentActions:2.3', '--accordionContentActions:2.3', 'browseControlBar:3', 'contentItemActions:5', 'contentItemContextActions:5'],
        contentActionsSeparator1: ['contentActions:0', 'accordionContentActions:2', 'rootContentActions:0'],
        contentActionsSeparator2: ['contentActions:10', '--accordionContentActions:10', 'narrowHeaderMenu:10'],
        clearClipboard: ['headerPrimaryActions:14', 'narrowHeaderMenu:14'],
        narrowHeaderMenu: [],
        narrowHeaderSelectionMenu: [],
        actionsLabel: ['narrowHeaderMenu:0', 'narrowHeaderSelectionMenu:0'],
        moreActionsLabel: ['narrowHeaderMenu:10.5'],
        publicationActionsLabel: ['narrowHeaderSelectionMenu:10.5'],
        selectionAction: ['notSelectedContentMenu:-10', 'selectedContentActions:-10'],
        viewUsages: [],
        flushPageCache: ['contentActions:6', '--accordionContentActions:6', 'browseControlBar:2.1'],
        flushSiteCache: ['contentActions:6', '--accordionContentActions:6', 'browseControlBar:2.2']
    };

    const menuActionWithRenderer = registry.add('action', 'menuAction', menuAction, {
        buttonIconEnd: <ChevronDown/>,
        menuRenderer: MenuRenderer,
        menuItemRenderer: MenuItemRenderer
    });
    registry.add('action', 'preview', {
        buttonIcon: <Visibility/>,
        buttonLabel: 'jcontent:label.contentManager.contentPreview.preview',
        component: PreviewActionComponent
    });
    registry.add('action', 'createContentFolder', {
        buttonIcon: <AddFolder/>,
        buttonLabel: 'jcontent:label.contentManager.create.contentFolder',
        createFolderType: 'contentFolder',
        component: CreateFolderActionComponent
    });
    registry.add('action', 'rename', {
        buttonIcon: <Edit/>,
        buttonLabel: 'jcontent:label.contentManager.rename',
        component: RenameActionComponent
    });
    registry.add('action', 'createFolder', {
        buttonIcon: <AddFolder/>,
        buttonLabel: 'jcontent:label.contentManager.create.folder',
        createFolderType: 'folder',
        component: CreateFolderActionComponent
    });
    registry.add('action', 'refresh', {
        buttonIcon: <Reload/>,
        buttonLabel: 'jcontent:label.contentManager.refresh',
        onClick: () => {
            triggerRefetchAll();
        }
    });
    registry.add('action', 'separator', {
        component: () => <Separator variant="vertical" invisible="firstOrLastChild"/>
    });
    registry.add('action', 'fileUpload', {
        buttonIcon: <Publish/>,
        buttonLabel: 'jcontent:label.contentManager.fileUpload.uploadButtonLabel',
        uploadType: 'fileUpload',
        component: FileUploadActionComponent
    });
    registry.add('action', 'publishMenu', menuActionWithRenderer, {
        buttonIcon: <Cloud/>,
        buttonLabel: 'jcontent:label.contentManager.contentPreview.publishMenu',
        menuTarget: 'publishMenu',
        hideOnNodeTypes: ['jnt:category'],
        isMenuPreload: true
    });
    registry.add('action', 'publish', {
        buttonIcon: <CloudUpload/>,
        buttonLabel: 'jcontent:label.contentManager.contentPreview.publish',
        buttonLabelShort: 'jcontent:label.contentManager.contentPreview.publishShort',
        publishType: 'publish',
        isPublishingAllLanguages: false,
        component: PublishActionComponent
    });
    registry.add('action', 'publishInAllLanguages', {
        buttonIcon: <CloudUpload/>,
        buttonLabel: 'jcontent:label.contentManager.contentPreview.publishInAllLanguages',
        publishType: 'publish',
        isPublishingAllLanguages: true,
        component: PublishActionComponent
    });
    registry.add('action', 'publishAll', {
        buttonIcon: <CloudUpload/>,
        buttonLabel: 'jcontent:label.contentManager.contentPreview.publishAll',
        buttonLabelShort: 'jcontent:label.contentManager.contentPreview.publishShort',
        publishType: 'publishAll',
        isPublishingAllLanguages: false,
        component: PublishActionComponent
    });
    registry.add('action', 'publishAllInAllLanguages', {
        buttonIcon: <CloudUpload/>,
        buttonLabel: 'jcontent:label.contentManager.contentPreview.publishAllInAllLanguages',
        publishType: 'publishAll',
        isPublishingAllLanguages: true,
        component: PublishActionComponent
    });
    registry.add('action', 'publishDeletion', {
        buttonIcon: <Delete/>,
        buttonLabel: 'jcontent:label.contentManager.contentPreview.publishDeletion',
        component: PublishDeletionActionComponent
    });
    registry.add('action', 'unpublish', {
        buttonIcon: <NoCloud/>,
        buttonLabel: 'jcontent:label.contentManager.contentPreview.unpublish',
        publishType: 'unpublish',
        isPublishingAllLanguages: false,
        component: PublishActionComponent
    });
    registry.add('action', 'unpublishInAllLanguages', {
        buttonIcon: <NoCloud/>,
        buttonLabel: 'jcontent:label.contentManager.contentPreview.unpublishInAllLanguages',
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
    registry.add('action', 'browseControlBarMenu', menuActionWithRenderer, {
        buttonIcon: <MoreVert/>,
        buttonLabel: 'jcontent:label.contentManager.contentPreview.moreOptions',
        menuTarget: 'browseControlBar',
        menuItemProps: {
            isShowIcons: true
        }
    });
    registry.add('action', 'contentItemActionsMenu', menuActionWithRenderer, {
        buttonIcon: <MoreVert/>,
        buttonLabel: 'jcontent:label.contentManager.contentPreview.moreOptions',
        menuTarget: 'contentItemActions',
        menuItemProps: {
            isShowIcons: true
        }
    });
    registry.add('action', 'contentItemContextActionsMenu', menuActionWithRenderer, {
        buttonIcon: <MoreVert/>,
        buttonLabel: 'jcontent:label.contentManager.contentPreview.moreOptions',
        menuTarget: 'contentItemContextActions',
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
        copyCutType: 'copy',
        hideOnNodeTypes: ['jnt:virtualsite', 'jnt:page', 'jmix:isAreaList'],
        hideForPaths: [PATH_FILES_ITSELF, PATH_CONTENTS_ITSELF, PATH_CATEGORIES_ITSELF],
        component: CopyCutActionComponent
    });
    registry.add('action', 'copyPageMenu', menuActionWithRenderer, {
        buttonIcon: <Copy/>,
        buttonLabel: 'jcontent:label.contentManager.copyPaste.copy',
        menuTarget: 'copyPageMenu',
        showOnNodeTypes: ['jnt:page'],
        component: CopyMenuComponent
    });
    registry.add('action', 'copyPageOnly', {
        buttonIcon: <Copy/>,
        buttonLabel: 'jcontent:label.contentManager.copyPaste.copyPageOnly',
        showOnNodeTypes: ['jnt:page'],
        copyCutType: 'copyPage',
        component: CopyCutActionComponent
    });
    registry.add('action', 'copyPageWithSubPages', {
        buttonIcon: <Copy/>,
        buttonLabel: 'jcontent:label.contentManager.copyPaste.copyPageWithSubPages',
        showOnNodeTypes: ['jnt:page'],
        hideIfHasNoSubPages: true,
        copyCutType: 'copy',
        component: CopyCutActionComponent
    });
    registry.add('action', 'cut', {
        buttonIcon: <Cut/>,
        buttonLabel: 'jcontent:label.contentManager.copyPaste.cut',
        copyCutType: 'cut',
        hideOnNodeTypes: ['jnt:virtualsite', 'jmix:hideDeleteAction', 'jmix:isAreaList'],
        hideForPaths: [PATH_FILES_ITSELF, PATH_CONTENTS_ITSELF, PATH_CATEGORIES_ITSELF],
        component: CopyCutActionComponent
    });
    registry.add('action', 'paste', {
        buttonIcon: <Paste/>,
        buttonLabel: 'jcontent:label.contentManager.copyPaste.paste',
        component: PasteActionComponent
    });
    registry.add('action', 'pasteReference', {
        buttonIcon: <PasteAsReference/>,
        buttonLabel: 'jcontent:label.contentManager.copyPaste.pasteReference',
        hideOnNodeTypes: ['jnt:page', 'jnt:navMenuText', 'jnt:category'],
        referenceTypes: ['jnt:contentReference'],
        component: PasteActionComponent
    });
    registry.add('action', 'delete', {
        buttonIcon: <Delete/>,
        buttonLabel: 'jcontent:label.contentManager.contentPreview.delete',
        hideOnNodeTypes: ['jnt:virtualsite', 'jmix:hideDeleteAction', 'jmix:isAreaList'],
        component: DeleteActionComponent
    });
    registry.add('action', 'deletePermanently', {
        buttonIcon: <Delete/>,
        buttonLabel: 'jcontent:label.contentManager.contentPreview.deletePermanently',
        component: DeletePermanentlyActionComponent
    });
    registry.add('action', 'undelete', {
        buttonIcon: <Undelete/>,
        buttonLabel: 'jcontent:label.contentManager.contentPreview.undelete',
        component: UndeleteActionComponent
    });
    registry.add('action', 'lock', {
        buttonLabel: 'jcontent:label.contentManager.contextMenu.lockActions.lock',
        buttonIcon: <Lock/>,
        component: LockActionComponent
    });
    registry.add('action', 'unlock', {
        buttonLabel: 'jcontent:label.contentManager.contextMenu.lockActions.unlock',
        buttonIcon: <Unlock/>,
        component: UnlockActionComponent
    });
    registry.add('action', 'clearAllLocks', {
        buttonIcon: <Lock/>,
        buttonLabel: 'jcontent:label.contentManager.contextMenu.lockActions.clearAllLocks',
        component: ClearAllLocksActionComponent
    });
    registry.add('action', 'locate', {
        buttonLabel: 'jcontent:label.contentManager.actions.locate',
        buttonIcon: <Search/>,
        component: LocateActionComponent
    });
    registry.add('action', 'subContents', {
        buttonIcon: <Subdirectory/>,
        buttonLabel: 'jcontent:label.contentManager.subContentsAction',
        component: SubContentsActionComponent
    });
    registry.add('action', 'exportPage', {
        buttonIcon: <Upload/>,
        buttonLabel: 'jcontent:label.contentManager.export.actionLabel',
        showOnNodeTypes: ['jnt:page'],
        requiredSitePermission: [ACTION_PERMISSIONS.exportPageAction],
        component: ExportActionComponent
    });
    registry.add('action', 'export', {
        buttonIcon: <Upload/>,
        buttonLabel: 'jcontent:label.contentManager.export.actionLabel',
        showOnNodeTypes: ['jnt:contentFolder', 'jnt:content', 'jnt:category'],
        requiredSitePermission: [ACTION_PERMISSIONS.exportAction],
        component: ExportActionComponent
    });
    registry.add('action', 'downloadAsZip', {
        buttonIcon: <Archive/>,
        buttonLabel: 'jcontent:label.contentManager.downloadAsZip',
        buttonLabelShort: 'jcontent:label.contentManager.downloadFile.download',
        showOnNodeTypes: ['jnt:file', 'jnt:folder'],
        component: DownloadAsZipActionComponent
    });
    registry.add('action', 'import', {
        buttonIcon: <Download/>,
        buttonLabel: 'jcontent:label.contentManager.import.action',
        uploadType: 'import',
        component: FileUploadActionComponent
    });
    registry.add('action', 'editImage', {
        buttonIcon: <Edit/>,
        buttonLabel: 'jcontent:label.contentManager.editImage.action',
        component: EditImageActionComponent
    });
    registry.add('action', 'downloadFile', {
        buttonIcon: <CloudDownload/>,
        buttonLabel: 'jcontent:label.contentManager.contentPreview.download',
        component: DownloadFileActionComponent
    });
    registry.add('action', 'replaceFile', {
        buttonIcon: <Reload/>,
        buttonLabel: 'jcontent:label.contentManager.fileUpload.replaceWith',
        uploadType: 'replaceWith',
        component: FileUploadActionComponent
    });
    registry.add('action', 'zip', {
        buttonIcon: <FileZip/>,
        buttonLabel: 'jcontent:label.contentManager.zipUnzip.zip',
        component: ZipActionComponent
    });
    registry.add('action', 'unzip', {
        buttonIcon: <FileZip/>,
        buttonLabel: 'jcontent:label.contentManager.zipUnzip.unzip',
        component: UnzipActionComponent
    });
    registry.add('action', 'search', {
        buttonIcon: <Search/>,
        buttonLabel: 'jcontent:label.contentManager.search.search',
        component: SearchActionComponent
    });
    registry.add('action', 'openInJContent', {
        buttonIcon: <OpenInBrowser/>,
        buttonLabel: 'jcontent:label.contentManager.actions.openInJContent',
        component: OpenInJContentActionComponent
    });
    registry.add('action', 'openInPageBuilder', {
        buttonIcon: <OpenInBrowser/>,
        buttonLabel: 'jcontent:label.contentManager.actions.openInPageBuilder',
        component: OpenInPageBuilderActionComponent
    });

    registry.add('action', 'openInLive', {
        buttonIcon: <OpenInNew/>,
        buttonLabel: 'jcontent:label.contentManager.actions.openInLive',
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
        component: OpenInPreviewActionComponent
    });

    registry.add('action', 'customizedPreview', {
        buttonIcon: <Visibility/>,
        buttonLabel: 'jcontent:label.contentManager.actions.customizedPreview.label',
        component: CustomizedPreviewActionComponent
    });

    registry.add('action', 'compareStagingToLive', {
        buttonIcon: <SwapHoriz/>,
        buttonLabel: 'jcontent:label.contentManager.actions.compareStagingToLive',
        component: CompareHtmlActionComponent
    });

    registry.add('action', 'openInRepositoryExplorer', {
        buttonIcon: <OpenInBrowser/>,
        buttonLabel: 'jcontent:label.contentManager.actions.openInRepositoryExplorer',
        component: OpenInRepositoryExplorerActionComponent
    });

    registry.add('action', 'contentActionsSeparator1', {
        isSeparator: true
    });

    registry.add('action', 'contentActionsSeparator2', {
        isSeparator: true
    });

    registry.add('action', 'clearClipboard', {
        buttonIcon: <ClearPaste/>,
        buttonLabel: 'jcontent:label.contentManager.copyPaste.clear',
        component: ClearClipboardActionComponent
    });

    /* Narrow header menu actions */

    registry.add('action', 'narrowHeaderMenu', menuActionWithRenderer, {
        buttonLabel: 'jcontent:label.contentManager.actions.menuLabel.actions',
        menuTarget: 'narrowHeaderMenu',
        menuItemProps: {
            isShowIcons: true
        }
    });

    registry.add('action', 'narrowHeaderSelectionMenu', menuActionWithRenderer, {
        buttonLabel: 'jcontent:label.contentManager.actions.menuLabel.actions',
        menuTarget: 'narrowHeaderSelectionMenu',
        menuItemProps: {
            isShowIcons: true
        },
        isMenuPreload: true,
        visibilityPredicate: menuState => menuState.loadedItems.filter(item => !(item.startsWith('actionsLabel-') || item.startsWith('publicationActionsLabel-'))).length > 0
    });

    registry.add('action', 'actionsLabel', {
        buttonLabel: 'jcontent:label.contentManager.actions.menuLabel.actions',
        isTitle: true
    });

    registry.add('action', 'moreActionsLabel', {
        buttonLabel: 'jcontent:label.contentManager.actions.menuLabel.moreActions',
        isTitle: true
    });

    registry.add('action', 'publicationActionsLabel', {
        buttonLabel: 'jcontent:label.contentManager.actions.menuLabel.publication',
        isTitle: true
    });

    registry.add('action', 'selectionAction', {
        component: SelectionActionComponent
    });

    registry.add('action', 'viewUsages', {
        component: ViewUsagesComponent
    });

    registry.add('action', 'flushPageCache', {
        component: FlushCacheActionComponent,
        showOnNodeTypes: ['jnt:page'],
        buttonLabel: 'jcontent:label.cache.flushPageCache',
        buttonIcon: <Replay/>
    });

    registry.add('action', 'flushSiteCache', {
        component: FlushCacheActionComponent,
        showOnNodeTypes: ['jnt:page', 'jnt:virtualsite'],
        buttonLabel: 'jcontent:label.cache.flushSiteCache',
        buttonIcon: <Replay/>
    });

    // Add targets to actions
    Object.keys(actionTargets).forEach(key => {
        registry.get('action', key).targets = actionTargets[key].map(t => {
            const spl = t.split(':');
            return {id: spl[0], priority: spl[1] ? spl[1] : 0};
        });
    });
};
