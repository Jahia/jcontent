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
    Object.entries(targetActions).forEach(([targetName, actions]) => {
        actions.forEach((name, index) => {
            // Priority can also be specified for a given target from the specified action in the array
            const [actionName, priority] = name?.split(':') || [];
            if (!actionTargets[actionName]) {
                actionTargets[actionName] = [];
            }

            actionTargets[actionName].push({id: targetName, priority: priority || index});
        });
    });

    // Assign target arrays
    Object.keys(actionTargets).forEach(key => {
        const action = registry.get('action', key);
        if (!action) {
            console.debug(`Unable to set target for action ${key}`);
            return;
        }

        // If the action already has targets, append to them
        if (action.targets) {
            action.targets = [...(new Set([...action.targets, ...actionTargets[key]]))];
        } else {
            action.targets = actionTargets[key];
        }
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
        'createContent',
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
        'clearClipboard',
        // Hardcoded so 'Open in page composer' can be always added at the end of this list
        'contentActionsSeparator3:50'
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
        'sbsTranslate',
        'downloadAsZip',
        'fileUpload',
        'lock',
        'unlock',
        'publishMenu',
        'contentActionsSeparator2',
        'publishDeletion',
        'copy',
        'copyPageMenu',
        'cut',
        'paste',
        'pasteReference',
        'delete',
        'deletePermanently',
        'undelete',
        // Hardcoded so 'Open in page composer' can be always added at the end of this list
        'contentActionsSeparator3:50'
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
        'unzip',
        'downloadFile',
        'downloadAsZip',
        'fileUpload',
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
        'delete',
        'deletePermanently',
        'undelete',
        'publishDeletion',
        'contentActionsSeparator2',
        'export',
        'exportPage',
        'import',
        'openInRepositoryExplorer',
        // Hardcoded so 'Open in page composer' can be always added at the end of this list
        'contentActionsSeparator3:50'
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
        'openInNewTab',
        'sbsTranslate',
        'replaceFile',
        'locate',
        'preview',
        'unzip',
        'downloadFile',
        'downloadAsZip',
        'fileUpload',
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
        'delete',
        'deletePermanently',
        'undelete',
        'publishDeletion',
        'contentActionsSeparator2',
        'export',
        'exportPage',
        'import',
        'openInRepositoryExplorer',
        // Hardcoded so 'Open in page composer' can be always added at the end of this list
        'contentActionsSeparator3:50'
    ],
    contentItemPickerContextActions: [
        'createContentFolder',
        'createFolder',
        'rename',
        'edit',
        'editPage',
        'editSource',
        'editImage',
        'openInNewTab',
        'replaceFile',
        'locate',
        'unzip',
        'downloadFile',
        'downloadAsZip',
        'fileUpload',
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
        'delete',
        'deletePermanently',
        'undelete',
        'publishDeletion',
        'contentActionsSeparator2',
        'export',
        'exportPage',
        'import',
        'openInRepositoryExplorer',
        // Hardcoded so 'Open in page composer' can be always added at the end of this list
        'contentActionsSeparator3:50'
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
        // Hardcoded so 'Open in page composer' can be always added at the end of this list
        'contentActionsSeparator3:50'
    ],
    '--accordionContentActions': ['replaceFile', 'locate', 'zip', 'unzip', 'openInPageBuilder', 'openInRepositoryExplorer', 'editImage', 'downloadFile', 'fileUpload', 'exportPage', 'export', 'downloadAsZip', 'import', 'unlock', 'clearAllLocks', 'flushPageCache', 'flushSiteCache', 'contentActionsSeparator2'],
    publishMenu: [
        'publish',
        'publishInAllLanguages',
        'publishAll',
        'publishAllInAllLanguages',
        'unpublish',
        'unpublishInAllLanguages',
        'showPublicationManager'
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
