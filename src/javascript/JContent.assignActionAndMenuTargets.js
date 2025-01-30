import {booleanValue} from './JContent/JContent.utils';
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

const showPageBuilder = booleanValue(contextJsParameters.config.jcontent?.showPageBuilder);

const actionTargetAssignments = {
    contentActions: ['createPage', 'createNavMenuItemMenu', 'contentActionsSeparator1', 'replaceFile', 'locate', 'preview', 'createContentFolder', 'rename', 'edit', 'editPage', 'zip', 'editAdvanced', 'editSource', 'editPageAdvanced', 'unzip', 'openInPageBuilder', 'openInRepositoryExplorer', 'editImage', 'createFolder', 'downloadFile', 'copy', 'copyPageMenu', 'cut', 'paste', 'pasteReference', 'fileUpload', 'publishDeletion', 'delete', 'deletePermanently', 'undelete', 'exportPage', 'export', 'downloadAsZip', 'import', 'lock', 'unlock', 'clearAllLocks', 'publishMenu', 'flushPageCache', 'flushSiteCache', 'contentActionsSeparator2', 'subContents'],
    createMenuActions: ['createPage', 'createNavMenuItemMenu', 'createContentFolder', 'createFolder', 'import', 'fileUpload'],
    headerPrimaryActions: showPageBuilder ? ['createPage', 'createContentFolder', 'createFolder', 'edit', 'editPage', 'fileUpload', 'import', 'paste', 'pasteReference', 'clearClipboard', 'refresh', 'separator'] : ['createPage', 'createContentFolder', 'createFolder', 'fileUpload', 'import', 'paste', 'pasteReference', 'clearClipboard', 'refresh', 'separator'],
    narrowHeaderMenu: ['actionsLabel', 'createPage', 'editSource', 'edit', 'editPage', 'editAdvanced', 'editPageAdvanced', 'createContentFolder', 'fileUpload', 'createFolder', 'paste', 'import', 'refresh', 'contentActionsSeparator2', 'replaceFile', 'locate', 'moreActionsLabel', 'rename', 'delete', 'deletePermanently', 'undelete', 'zip', 'unzip', 'openInPageBuilder', 'editImage', 'exportPage', 'export', 'downloadFile', 'publishDeletion', 'lock', 'unlock', 'clearAllLocks', 'downloadAsZip', 'clearClipboard'],
    accordionContentActions: ['createFolder', 'createPage', 'createNavMenuItemMenu', 'contentActionsSeparator1', 'edit', 'editPage', 'editAdvanced', 'editSource', 'editPageAdvanced', 'lock', 'publishMenu', 'publishDeletion', 'copy', 'copyPageMenu', 'cut', 'paste', 'pasteReference', 'delete', 'deletePermanently', 'undelete'],
    '--accordionContentActions': ['replaceFile', 'locate', 'zip', 'unzip', 'openInPageBuilder', 'openInRepositoryExplorer', 'editImage', 'downloadFile', 'fileUpload', 'exportPage', 'export', 'downloadAsZip', 'import', 'unlock', 'clearAllLocks', 'flushPageCache', 'flushSiteCache', 'contentActionsSeparator2'],
    selectedContentActions: ['selectionAction', 'downloadAsZip', 'zip', 'publishMenu', 'export', 'copy', 'copyPageMenu', 'cut', 'publishDeletion', 'delete', 'deletePermanently', 'undelete'],
    contentItemActions: ['editAdvanced', 'editPageAdvanced', 'lock', 'unlock', 'publishMenu', 'copy', 'cut', 'paste', 'pasteReference', 'delete', 'deletePermanently', 'undelete', 'export', 'import', 'openInRepositoryExplorer'],
    contentItemContextActions: ['edit', 'editAdvanced', 'editPage', 'editPageAdvanced', 'lock', 'unlock', 'publishMenu', 'copy', 'cut', 'paste', 'pasteReference', 'delete', 'deletePermanently', 'undelete', 'export', 'import', 'openInRepositoryExplorer'],
    publishMenu: ['publish', 'publishInAllLanguages', 'publishAll', 'publishAllInAllLanguages', 'unpublish', 'unpublishInAllLanguages'],
    narrowHeaderSelectionMenu: ['actionsLabel', 'zip', 'downloadAsZip', 'copy', 'copyPageMenu', 'cut', 'delete', 'deletePermanently', 'undelete', 'import', 'publicationActionsLabel', 'publish', 'publishInAllLanguages', 'publishAll', 'publishAllInAllLanguages', 'publishDeletion', 'unpublish', 'unpublishInAllLanguages'],
    copyPageMenu: ['copyPageOnly', 'copyPageWithSubPages'],
    rootContentActions: ['createPage', 'createNavMenuItemMenu', 'contentActionsSeparator1', 'paste'],
    visibleContentItemActions: ['edit', 'editPage', 'lock', 'unlock'],
    browseControlBar: ['editAdvanced', 'editPageAdvanced', 'import', 'exportPage', 'export', 'clearAllLocks', 'flushPageCache', 'flushSiteCache', 'openInRepositoryExplorer'],
    openInPreviewMenu: ['customizedPreview', 'compareStagingToLive'],
    notSelectedContentMenu: ['selectionAction'],
    'content-editor/header/main-save-actions': ['createButton', 'submitSave'],
    createNavMenuItemMenu: ['createNavMenuItem'],
    'content-editor/header/main-publish-actions': ['publishAction', 'startWorkflowMainButton'],
    'content-editor/header/3dots': ['goToWorkInProgress', 'copyLanguageAction']
};

export const assignActionAndMenuTargets = () => {
    assignTargetsForActions(actionTargetAssignments, registry);
};

// Old action => target assignments for jcontent and content editor, kept for reference
// Const actionTargets = {
//     menuAction: [],
//     preview: ['contentActions:1'],
//     createContentFolder: ['createMenuActions:3', 'contentActions:2', 'headerPrimaryActions:2', 'narrowHeaderMenu:2'],
//     rename: ['contentActions:2', 'narrowHeaderMenu:12'],
//     createFolder: ['createMenuActions:3', 'contentActions:3', 'accordionContentActions:1', 'headerPrimaryActions:2.5', 'narrowHeaderMenu:2.5'],
//     refresh: ['headerPrimaryActions:15', 'narrowHeaderMenu:5'],
//     separator: ['headerPrimaryActions:20'],
//     fileUpload: ['createMenuActions:4', 'contentActions:4', '--accordionContentActions:4', 'headerPrimaryActions:3', 'narrowHeaderMenu:2.3'],
//     publishMenu: ['contentActions:6', 'accordionContentActions:2.3', 'selectedContentActions:1', 'contentItemActions:1.2', 'contentItemContextActions:1.2'],
//     publish: ['publishMenu:1', 'narrowHeaderSelectionMenu:11'],
//     publishInAllLanguages: ['publishMenu:2', 'narrowHeaderSelectionMenu:12'],
//     publishAll: ['publishMenu:3', 'narrowHeaderSelectionMenu:13'],
//     publishAllInAllLanguages: ['publishMenu:4', 'narrowHeaderSelectionMenu:14'],
//     publishDeletion: ['contentActions:4', 'accordionContentActions:2.3', 'selectedContentActions:4', 'narrowHeaderSelectionMenu:14', 'narrowHeaderMenu:14'],
//     unpublish: ['publishMenu:5', 'narrowHeaderSelectionMenu:15'],
//     unpublishInAllLanguages: ['publishMenu:6', 'narrowHeaderSelectionMenu:16'],
//     contentMenu: [],
//     accordionContentMenu: [],
//     rootContentMenu: [],
//     selectedContentMenu: [],
//     notSelectedContentMenu: [],
//     copy: ['contentActions:3.8', 'accordionContentActions:3', 'selectedContentActions:3.8', 'narrowHeaderSelectionMenu:3.8', 'contentItemActions:3', 'contentItemContextActions:1.3'],
//     copyPageMenu: ['contentActions:3.8', 'accordionContentActions:3', 'selectedContentActions:3.8', 'narrowHeaderSelectionMenu:3.8'],
//     copyPageOnly: ['copyPageMenu:1'],
//     copyPageWithSubPages: ['copyPageMenu:2'],
//     cut: ['contentActions:3.9', 'accordionContentActions:3.1', 'selectedContentActions:3.9', 'narrowHeaderSelectionMenu:3.9', 'contentItemActions:3.1', 'contentItemContextActions:3:1'],
//     paste: ['headerPrimaryActions:10', 'contentActions:3.91', 'accordionContentActions:3.2', 'rootContentActions:3.91', 'narrowHeaderMenu:4', 'contentItemActions:3.2', 'contentItemContextActions:3.2'],
//     pasteReference: ['headerPrimaryActions:10.1', 'contentActions:3.92', 'accordionContentActions:3.2', 'contentItemActions:3.3', 'contentItemContextActions:3.3'],
//     delete: ['contentActions:4', 'accordionContentActions:3.3', 'selectedContentActions:4', 'narrowHeaderMenu:12', 'narrowHeaderSelectionMenu:4', 'contentItemActions:3.4', 'contentItemContextActions:3.4'],
//     deletePermanently: ['contentActions:4', 'accordionContentActions:3.3', 'selectedContentActions:4', 'narrowHeaderMenu:12', 'narrowHeaderSelectionMenu:4', 'contentItemActions:3.4', 'contentItemContextActions:3.4'],
//     undelete: ['contentActions:4.1', 'accordionContentActions:3.3', 'selectedContentActions:4.1', 'narrowHeaderMenu:12', 'narrowHeaderSelectionMenu:4', 'contentItemActions:3.4', 'contentItemContextActions:3.4'],
//     lock: ['contentActions:5', 'accordionContentActions:2.2', 'narrowHeaderMenu:14', 'contentItemActions:1.1', 'visibleContentItemActions:1.1', 'contentItemContextActions:1.1'],
//     unlock: ['contentActions:5', '--accordionContentActions:5', 'narrowHeaderMenu:14', 'contentItemActions:1.1', 'visibleContentItemActions:1.1', 'contentItemContextActions:1.1'],
//     clearAllLocks: ['contentActions:5.5', '--accordionContentActions:5.5', 'narrowHeaderMenu:14', 'browseControlBar:2'],
//     locate: ['contentActions:0.5', '--accordionContentActions:0.5', 'narrowHeaderMenu:10.5'],
//     subContents: ['contentActions:15'],
//     exportPage: ['contentActions:4.2', '--accordionContentActions:4.2', 'narrowHeaderMenu:13', 'browseControlBar:1.2'],
//     export: ['contentActions:4.2', '--accordionContentActions:4.2', 'narrowHeaderMenu:13', 'selectedContentActions:2', 'browseControlBar:1.2', 'contentItemActions:4', 'contentItemContextActions:4'],
//     downloadAsZip: ['contentActions:4.21', '--accordionContentActions:4.21', 'selectedContentActions', 'narrowHeaderMenu:14', 'narrowHeaderSelectionMenu:1'],
//     import: ['contentActions:4.3', '--accordionContentActions:4.3', 'createMenuActions:3.5', 'narrowHeaderMenu:4', 'narrowHeaderSelectionMenu:4', 'headerPrimaryActions:4', 'browseControlBar:1.1', 'contentItemActions:4', 'contentItemContextActions:4'],
//     editImage: ['contentActions:2.5', '--accordionContentActions:2.5', 'narrowHeaderMenu:12.5'],
//     downloadFile: ['contentActions:3.7', '--accordionContentActions:3.7', 'narrowHeaderMenu:13.7'],
//     replaceFile: ['contentActions:0.2', '--accordionContentActions:0.2', 'narrowHeaderMenu:10.2'],
//     zip: ['contentActions:2.1', '--accordionContentActions:2.1', 'selectedContentActions', 'narrowHeaderSelectionMenu:0.5', 'narrowHeaderMenu:12'],
//     unzip: ['contentActions:2.2', '--accordionContentActions:2.2', 'narrowHeaderMenu:12.2'],
//     search: [],
//     openInJContent: [],
//     openInPageBuilder: ['contentActions:2.2', '--accordionContentActions:2.2', 'narrowHeaderMenu:12.2'],
//     openInLive: [],
//     openInPreviewMenu: [],
//     openInPreview: [],
//     customizedPreview: ['openInPreviewMenu:1'],
//     compareStagingToLive: ['openInPreviewMenu:2'],
//     openInRepositoryExplorer: ['contentActions:2.3', '--accordionContentActions:2.3', 'browseControlBar:3', 'contentItemActions:5', 'contentItemContextActions:5'],
//     contentActionsSeparator1: ['contentActions:0', 'accordionContentActions:2', 'rootContentActions:0'],
//     contentActionsSeparator2: ['contentActions:10', '--accordionContentActions:10', 'narrowHeaderMenu:10'],
//     clearClipboard: ['headerPrimaryActions:14', 'narrowHeaderMenu:14'],
//     narrowHeaderMenu: [],
//     narrowHeaderSelectionMenu: [],
//     actionsLabel: ['narrowHeaderMenu:0', 'narrowHeaderSelectionMenu:0'],
//     moreActionsLabel: ['narrowHeaderMenu:10.5'],
//     publicationActionsLabel: ['narrowHeaderSelectionMenu:10.5'],
//     selectionAction: ['notSelectedContentMenu:-10', 'selectedContentActions:-10'],
//     viewUsages: [],
//     flushPageCache: ['contentActions:6', '--accordionContentActions:6', 'browseControlBar:2.1'],
//     flushSiteCache: ['contentActions:6', '--accordionContentActions:6', 'browseControlBar:2.2'],
//     createNavMenuItemMenu: ['createMenuActions:-1', 'contentActions:-1', 'accordionContentActions:1.1', 'rootContentActions:-1'],
//     createPage: ['createMenuActions:-2', 'contentActions:-2', 'accordionContentActions:1', 'rootContentActions:-2', 'headerPrimaryActions:1', 'narrowHeaderMenu:1'],
//     createButton: ['content-editor/header/main-save-actions'],
//     createNavMenuItem: ['createNavMenuItemMenu'],
//     edit: showPageBuilder ?
//         ['contentActions:2', 'accordionContentActions:2', 'headerPrimaryActions:1.5', 'narrowHeaderMenu:1.5', 'visibleContentItemActions:1', 'contentItemContextActions:1'] :
//         ['contentActions:2', 'accordionContentActions:2', 'narrowHeaderMenu:1.5', 'visibleContentItemActions:1', 'contentItemContextActions:1'],
//     editAdvanced: ['contentActions:2.1', 'accordionContentActions:2.1', 'narrowHeaderMenu:1.6', 'browseControlBar:1', 'contentItemActions:1', 'contentItemContextActions:1'],
//     editSource: ['contentActions:2.1', 'accordionContentActions:2.1', 'narrowHeaderMenu:1.1'],
//     editPage: showPageBuilder ?
//         ['contentActions:2', 'accordionContentActions:2', 'headerPrimaryActions:1.5', 'narrowHeaderMenu:1.5', 'visibleContentItemActions:1', 'contentItemContextActions:1'] :
//         ['contentActions:2', 'accordionContentActions:2', 'narrowHeaderMenu:1.5', 'visibleContentItemActions:1', 'contentItemContextActions:1'],
//     editPageAdvanced: ['contentActions:2.1', 'accordionContentActions:2.1', 'narrowHeaderMenu:1.6', 'browseControlBar:1', 'contentItemActions:1', 'contentItemContextActions:1'],
//     quickEdit: [],
//     submitSave: ['content-editor/header/main-save-actions'],
//     publishAction: ['content-editor/header/main-publish-actions:1'],
//     startWorkflowMainButton: ['content-editor/header/main-publish-actions:1'],
//     'content-editor/header/3dots': [],
//     'content-editor/field/3dots': [],
//     goToWorkInProgress: ['content-editor/header/3dots:1'],
//     copyLanguageAction: ['content-editor/header/3dots:2']
// };

// Transform {action: targets} into {target: actions}
// Export const createTargets = o => {
//     const targetActions = {};
//
//     Object.keys(o).forEach(key => {
//         const assignedTargets = o[key];
//
//         assignedTargets.forEach(target => {
//             const split = target.split(':');
//             const targetName = split[0];
//
//             if (!targetActions[targetName]) {
//                 targetActions[targetName] = {};
//             }
//
//             targetActions[targetName][key] = Number.parseFloat(split[1] ?? 0);
//         });
//     });
//
//     console.log(targetActions);
//     return targetActions;
// };
