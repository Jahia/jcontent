import {registry} from '@jahia/ui-extender';

/**
 * Connect targets with actions
 *
 * @param targetActions object structure: {<targetName>: [<actionName>, ...], ...}
 * @param registry
 */
const assignTargetsForActions = (targetActions, registry) => {
    const actionTargets = {};

    // Construct target arrays for each action
    Object.keys(targetActions).forEach(targetName => {
        const actions = targetActions[targetName];

        actions.forEach((actionName, index) => {
            if (!actionTargets[actionName]) {
                actionTargets[actionName] = [];
            }

            actionTargets[actionName].push(`${targetName}:${index}`);
        });
    });

    // Assign target arrays
    Object.keys(actionTargets).forEach(key => {
        registry.get('action', key).targets = actionTargets[key].map(t => {
            const spl = t.split(':');
            return {id: spl[0], priority: spl[1] ? spl[1] : 0};
        });
    });
};

const actionTargetAssignments = {
    '--contentActions': ['createPage', 'createNavMenuItemMenu', 'contentActionsSeparator1', 'createContent', 'replaceFile', 'locate', 'preview', 'createContentFolder', 'rename', 'edit', 'editPage', 'zip', 'editAdvanced', 'editSource', 'editPageAdvanced', 'unzip', 'openInPageBuilder', 'openInRepositoryExplorer', 'editImage', 'createFolder', 'downloadFile', 'copy', 'copyPageMenu', 'cut', 'paste', 'pasteReference', 'fileUpload', 'publishDeletion', 'delete', 'deletePermanently', 'undelete', 'exportPage', 'export', 'downloadAsZip', 'import', 'lock', 'unlock', 'clearAllLocks', 'publishMenu', 'flushPageCache', 'flushSiteCache', 'contentActionsSeparator2', 'subContents'],
    createMenuActions: [
        'createPage',
        'createNavMenuItemMenu',
        'createContentFolder',
        'createFolder',
        'import',
        'fileUpload'
    ],
    headerPrimaryActions: [
        'createPage',
        'createContentFolder',
        'createFolder',
        'createContent',
        'edit',
        'editPage',
        'fileUpload',
        'paste',
        'pasteReference',
        'clearClipboard',
        'refresh',
        'separator'
    ],
    narrowHeaderMenu: [
        'actionsLabel',
        'createPage',
        'editSource',
        'edit',
        'editPage',
        'editAdvanced',
        'editPageAdvanced',
        'createContentFolder',
        'fileUpload',
        'createFolder',
        'paste',
        'import',
        'refresh',
        'contentActionsSeparator2',
        'replaceFile',
        'locate',
        'moreActionsLabel',
        'rename',
        'delete',
        'deletePermanently',
        'undelete',
        'zip',
        'unzip',
        'openInPageBuilder',
        'editImage',
        'export',
        'exportPage',
        'downloadFile',
        'publishDeletion',
        'lock',
        'unlock',
        'clearAllLocks',
        'downloadAsZip',
        'clearClipboard'
    ],
    accordionContentActions: [
        'createFolder',
        'createPage',
        'createNavMenuItemMenu',
        'rename',
        'contentActionsSeparator1',
        'edit',
        'editAdvanced',
        'editPage',
        'editPageAdvanced',
        'downloadAsZip',
        'lock',
        'publishMenu',
        'contentActionsSeparator2',
        'publishDeletion',
        'copy',
        'copyPageMenu',
        'cut',
        'paste',
        'pasteReference',
        'fileUpload',
        'delete',
        'deletePermanently',
        'undelete',
        'contentActionsSeparator3'
    ],
    selectedContentActions: [
        'selectionAction',
        'downloadAsZip',
        'zip',
        'publishMenu',
        'export',
        'copy',
        'copyPageMenu',
        'cut',
        'publishDeletion',
        'delete',
        'deletePermanently',
        'undelete'
    ],
    // 3 dots item menu
    contentItemActions: [
        'createContentFolder',
        'createFolder',
        'createContent',
        'rename',
        'edit',
        'editAdvanced',
        'editPage',
        'editPageAdvanced',
        'editSource',
        'editImage',
        'replaceFile',
        'locate',
        'preview',
        'downloadFile',
        'downloadAsZip',
        'lock',
        'unlock',
        'clearAllLocks',
        'publishMenu',
        'contentActionsSeparator1',
        'copy',
        'copyPageMenu',
        'cut',
        'paste',
        'pasteReference',
        'fileUpload',
        'delete',
        'deletePermanently',
        'undelete',
        'publishDeletion',
        'contentActionsSeparator2',
        'export',
        'exportPage',
        'import',
        'openInRepositoryExplorer',
        'contentActionsSeparator3'
    ],
    contentItemContextActions: [
        'createContentFolder',
        'createFolder',
        'createContent',
        'rename',
        'edit',
        'editAdvanced',
        'editPage',
        'editPageAdvanced',
        'editSource',
        'editImage',
        'replaceFile',
        'locate',
        'preview',
        'downloadFile',
        'downloadAsZip',
        'lock',
        'unlock',
        'clearAllLocks',
        'publishMenu',
        'contentActionsSeparator1',
        'copy',
        'copyPageMenu',
        'cut',
        'paste',
        'pasteReference',
        'fileUpload',
        'delete',
        'deletePermanently',
        'undelete',
        'publishDeletion',
        'contentActionsSeparator2',
        'export',
        'exportPage',
        'import',
        'openInRepositoryExplorer',
        'contentActionsSeparator3'
    ],
    // 3 dots header menu
    browseControlBar: [
        'rename',
        'editAdvanced',
        'editPageAdvanced',
        'downloadFile',
        'downloadAsZip',
        'lock',
        'unlock',
        'clearAllLocks',
        'contentActionsSeparator1',
        'delete',
        'deletePermanently',
        'undelete',
        'flushPageCache',
        'flushSiteCache',
        'contentActionsSeparator2',
        'export',
        'exportPage',
        'import',
        'openInRepositoryExplorer',
        'contentActionsSeparator3'
    ],
    '--accordionContentActions': ['replaceFile', 'locate', 'zip', 'unzip', 'openInPageBuilder', 'openInRepositoryExplorer', 'editImage', 'downloadFile', 'fileUpload', 'exportPage', 'export', 'downloadAsZip', 'import', 'unlock', 'clearAllLocks', 'flushPageCache', 'flushSiteCache', 'contentActionsSeparator2'],
    publishMenu: [
        'publish',
        'publishInAllLanguages',
        'publishAll',
        'publishAllInAllLanguages',
        'unpublish',
        'unpublishInAllLanguages'
    ],
    narrowHeaderSelectionMenu: [
        'actionsLabel',
        'zip',
        'downloadAsZip',
        'contentActionsSeparator1',
        'copy',
        'copyPageMenu',
        'cut',
        'delete',
        'deletePermanently',
        'undelete',
        'contentActionsSeparator2',
        'import',
        'publicationActionsLabel',
        'publish',
        'publishInAllLanguages',
        'publishAll',
        'publishAllInAllLanguages',
        'publishDeletion',
        'unpublish',
        'unpublishInAllLanguages'
    ],
    copyPageMenu: [
        'copyPageOnly',
        'copyPageWithSubPages'
    ],
    rootContentActions: [
        'createPage',
        'createNavMenuItemMenu',
        'contentActionsSeparator1',
        'paste'
    ],
    visibleContentItemActions: [
        'preview',
        'edit',
        'editPage',
        'subContents'
    ],
    openInPreviewMenu: [
        'customizedPreview',
        'compareStagingToLive'
    ],
    notSelectedContentMenu: [
        'selectionAction'
    ],
    'content-editor/header/main-save-actions': [
        'createButton',
        'submitSave'
    ],
    createNavMenuItemMenu: [
        'createNavMenuItem'
    ],
    'content-editor/header/main-publish-actions': [
        'publishAction',
        'startWorkflowMainButton'
    ],
    'content-editor/header/3dots': [
        'goToWorkInProgress',
        'copyLanguageAction'
    ]
};

export const assignActionAndMenuTargets = () => {
    assignTargetsForActions(actionTargetAssignments, registry);
};
