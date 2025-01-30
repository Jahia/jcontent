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
