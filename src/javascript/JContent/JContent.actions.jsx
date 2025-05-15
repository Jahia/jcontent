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
    EditImage,
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
    Rename,
    Replay,
    Search,
    Separator,
    Subdirectory,
    SwapHoriz,
    Undelete,
    Unlock,
    Upload,
    Visibility
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
    FlushCacheActionComponent,
    PublishManagerActionComponent
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
        component: PreviewActionComponent
    });
    registry.add('action', 'createContentFolder', {
        buttonIcon: <AddFolder/>,
        buttonLabel: 'jcontent:label.contentManager.create.contentFolder',
        createFolderType: 'contentFolder',
        component: CreateFolderActionComponent
    });
    registry.add('action', 'rename', {
        buttonIcon: <Rename/>,
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
    registry.add('action', 'showPublicationManager', {
        buttonIcon: <Publish/>,
        buttonLabel: 'jcontent:label.contentManager.publicationDashboard.label',
        publicationNodeTypes: ['jmix:publication', 'jmix:workflowRulesable', 'jnt:navMenuText'],
        component: PublishManagerActionComponent
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
        menuTarget: ['browseControlBar', 'contentActions'],
        menuItemProps: {
            isShowIcons: true
        }
    });
    registry.add('action', 'contentItemActionsMenu', menuActionWithRenderer, {
        buttonIcon: <MoreVert/>,
        buttonLabel: 'jcontent:label.contentManager.contentPreview.moreOptions',
        menuTarget: ['contentItemActions', 'contentActions'],
        menuItemProps: {
            isShowIcons: true
        }
    });
    registry.add('action', 'contentItemContextActionsMenu', menuActionWithRenderer, {
        buttonIcon: <MoreVert/>,
        buttonLabel: 'jcontent:label.contentManager.contentPreview.moreOptions',
        menuTarget: ['contentItemContextActions', 'contentActions'],
        menuItemProps: {
            isShowIcons: true
        }
    });
    registry.add('action', 'accordionContentMenu', menuActionWithRenderer, {
        buttonIcon: <MoreVert/>,
        buttonLabel: 'jcontent:label.contentManager.contentPreview.moreOptions',
        menuTarget: ['accordionContentActions', 'contentActions'],
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
        buttonIcon: <EditImage/>,
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

    registry.add('action', 'contentActionsSeparator3', {
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
};
