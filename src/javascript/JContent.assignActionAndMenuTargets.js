import {booleanValue} from './JContent/JContent.utils';
import {registry} from '@jahia/ui-extender';

/**
 * Connect targets with actions
 *
 * @param targetActions object structure: {<targetName>: {<actionName>: <priority>, ...}, ...}
 * @param registry
 */
const assignTargetsForActions = (targetActions, registry) => {
    const actionTargets = {};

    // Construct target arrays for each action
    Object.keys(targetActions).forEach(targetName => {
        const actions = targetActions[targetName];

        Object.keys(actions).forEach(actionName => {
            if (!actionTargets[actionName]) {
                actionTargets[actionName] = [];
            }

            actionTargets[actionName].push(`${targetName}:${actions[actionName]}`);
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
    contentActions: {
        preview: 1,
        createContentFolder: 2,
        rename: 2,
        createFolder: 3,
        fileUpload: 4,
        publishMenu: 6,
        publishDeletion: 4,
        copy: 3.8,
        copyPageMenu: 3.8,
        cut: 3.9,
        paste: 3.91,
        pasteReference: 3.92,
        delete: 4,
        deletePermanently: 4,
        undelete: 4.1,
        lock: 5,
        unlock: 5,
        clearAllLocks: 5.5,
        locate: 0.5,
        subContents: 15,
        exportPage: 4.2,
        export: 4.2,
        downloadAsZip: 4.21,
        import: 4.3,
        editImage: 2.5,
        downloadFile: 3.7,
        replaceFile: 0.2,
        zip: 2.1,
        unzip: 2.2,
        openInPageBuilder: 2.2,
        openInRepositoryExplorer: 2.3,
        contentActionsSeparator1: 0,
        contentActionsSeparator2: 10,
        flushPageCache: 6,
        flushSiteCache: 6,
        createNavMenuItemMenu: -1,
        createPage: -2,
        edit: 2,
        editAdvanced: 2.1,
        editSource: 2.1,
        editPage: 2,
        editPageAdvanced: 2.1
    },
    createMenuActions: {
        createContentFolder: 3,
        createFolder: 3,
        fileUpload: 4,
        import: 3.5,
        createNavMenuItemMenu: -1,
        createPage: -2
    },
    headerPrimaryActions: {
        createContentFolder: 2,
        createFolder: 2.5,
        refresh: 15,
        separator: 20,
        fileUpload: 3,
        paste: 10,
        pasteReference: 10.1,
        import: 4,
        clearClipboard: 14,
        createPage: 1,
        ...(showPageBuilder && {edit: 1.5, editPage: 1.5})
    },
    narrowHeaderMenu: {
        createContentFolder: 2,
        rename: 12,
        createFolder: 2.5,
        refresh: 5,
        fileUpload: 2.3,
        publishDeletion: 14,
        paste: 4,
        delete: 12,
        deletePermanently: 12,
        undelete: 12,
        lock: 14,
        unlock: 14,
        clearAllLocks: 14,
        locate: 10.5,
        exportPage: 13,
        export: 13,
        downloadAsZip: 14,
        import: 4,
        editImage: 12.5,
        downloadFile: 13.7,
        replaceFile: 10.2,
        zip: 12,
        unzip: 12.2,
        openInPageBuilder: 12.2,
        contentActionsSeparator2: 10,
        clearClipboard: 14,
        actionsLabel: 0,
        moreActionsLabel: 10.5,
        createPage: 1,
        edit: 1.5,
        editAdvanced: 1.6,
        editSource: 1.1,
        editPage: 1.5,
        editPageAdvanced: 1.6
    },
    accordionContentActions: {
        createFolder: 1,
        publishMenu: 2.3,
        publishDeletion: 2.3,
        copy: 3,
        copyPageMenu: 3,
        cut: 3.1,
        paste: 3.2,
        pasteReference: 3.2,
        delete: 3.3,
        deletePermanently: 3.3,
        undelete: 3.3,
        lock: 2.2,
        contentActionsSeparator1: 2,
        createNavMenuItemMenu: 1.1,
        createPage: 1,
        edit: 2,
        editAdvanced: 2.1,
        editSource: 2.1,
        editPage: 2,
        editPageAdvanced: 2.1
    },
    '--accordionContentActions': {
        fileUpload: 4,
        unlock: 5,
        clearAllLocks: 5.5,
        locate: 0.5,
        exportPage: 4.2,
        export: 4.2,
        downloadAsZip: 4.21,
        import: 4.3,
        editImage: 2.5,
        downloadFile: 3.7,
        replaceFile: 0.2,
        zip: 2.1,
        unzip: 2.2,
        openInPageBuilder: 2.2,
        openInRepositoryExplorer: 2.3,
        contentActionsSeparator2: 10,
        flushPageCache: 6,
        flushSiteCache: 6
    },
    selectedContentActions: {
        publishMenu: 1,
        publishDeletion: 4,
        copy: 3.8,
        copyPageMenu: 3.8,
        cut: 3.9,
        delete: 4,
        deletePermanently: 4,
        undelete: 4.1,
        export: 2,
        downloadAsZip: 0,
        zip: 0,
        selectionAction: -10
    },
    contentItemActions: {
        publishMenu: 1.2,
        copy: 3,
        cut: 3.1,
        paste: 3.2,
        pasteReference: 3.3,
        delete: 3.4,
        deletePermanently: 3.4,
        undelete: 3.4,
        lock: 1.1,
        unlock: 1.1,
        export: 4,
        import: 4,
        openInRepositoryExplorer: 5,
        editAdvanced: 1,
        editPageAdvanced: 1
    },
    contentItemContextActions: {
        publishMenu: 1.2,
        copy: 1.3,
        cut: 3,
        paste: 3.2,
        pasteReference: 3.3,
        delete: 3.4,
        deletePermanently: 3.4,
        undelete: 3.4,
        lock: 1.1,
        unlock: 1.1,
        export: 4,
        import: 4,
        openInRepositoryExplorer: 5,
        edit: 1,
        editAdvanced: 1,
        editPage: 1,
        editPageAdvanced: 1
    },
    publishMenu: {
        publish: 1,
        publishInAllLanguages: 2,
        publishAll: 3,
        publishAllInAllLanguages: 4,
        unpublish: 5,
        unpublishInAllLanguages: 6
    },
    narrowHeaderSelectionMenu: {
        publish: 11,
        publishInAllLanguages: 12,
        publishAll: 13,
        publishAllInAllLanguages: 14,
        publishDeletion: 14,
        unpublish: 15,
        unpublishInAllLanguages: 16,
        copy: 3.8,
        copyPageMenu: 3.8,
        cut: 3.9,
        delete: 4,
        deletePermanently: 4,
        undelete: 4,
        downloadAsZip: 1,
        import: 4,
        zip: 0.5,
        actionsLabel: 0,
        publicationActionsLabel: 10.5
    },
    copyPageMenu: {copyPageOnly: 1, copyPageWithSubPages: 2},
    rootContentActions: {paste: 3.91, contentActionsSeparator1: 0, createNavMenuItemMenu: -1, createPage: -2},
    visibleContentItemActions: {lock: 1.1, unlock: 1.1, edit: 1, editPage: 1},
    browseControlBar: {
        clearAllLocks: 2,
        exportPage: 1.2,
        export: 1.2,
        import: 1.1,
        openInRepositoryExplorer: 3,
        flushPageCache: 2.1,
        flushSiteCache: 2.2,
        editAdvanced: 1,
        editPageAdvanced: 1
    },
    openInPreviewMenu: {customizedPreview: 1, compareStagingToLive: 2},
    notSelectedContentMenu: {selectionAction: -10},
    'content-editor/header/main-save-actions': {createButton: 0, submitSave: 0},
    createNavMenuItemMenu: {createNavMenuItem: 0},
    'content-editor/header/main-publish-actions': {publishAction: 1, startWorkflowMainButton: 1},
    'content-editor/header/3dots': {goToWorkInProgress: 1, copyLanguageAction: 2}
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
