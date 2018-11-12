import React from "react";
import {actionsRegistry, menuAction} from "@jahia/react-material";
import {Add, Delete, Edit, Error, Menu, Publish, Visibility} from "@material-ui/icons";
import Constants from "../constants";
import createContentOfTypeAction from './createContentOfTypeAction'
import createContentAction from './createContentAction'
import fileUploadAction from './fileUploadAction'
import editAction from './editAction'
import deleteAction from './deleteAction'
import undeleteAction from './undeleteAction'
import deletePermanentlyAction from './deletePermanentlyAction'
import publishAction from './publishAction'
import publishDeletionAction from './publishDeletionAction'
import previewAction from './previewAction'
import pasteAction from './pasteAction'
import copyAction from './copyAction'
import lockManagementAction from './lockManagementAction'
import workflowDashboardAction from './workflowDashboardAction';
import {routerAction} from "./routerAction";
import sideMenuAction from "./sideMenuAction";
import requirementsAction from './requirementsAction'

function initActions(actionsRegistry) {
    actionsRegistry.add('edit', editAction, {
        buttonIcon: <Edit/>,
        buttonLabel: "label.contentManager.contentPreview.edit",
        target: ["editPreviewBar:2.5", "contentTreeMenuActions:2.5", "tableActions:2", "contextualMenuPagesAction:2.5", "contextualMenuFoldersAction:2.5", "contextualMenuFilesAction:2.5", "contextualMenuContentAction:2.5"]
    });
    actionsRegistry.add('preview', previewAction, {
        buttonIcon: <Visibility/>,
        buttonLabel: "label.contentManager.contentPreview.preview",
        target: ["tableActions:1"]
    });
    actionsRegistry.add('createContentFolder', createContentOfTypeAction, {
        buttonLabel: "label.contentManager.create.contentFolder",
        target: ["createMenuActions:3", "contentTreeMenuActions:3", "contextualMenuFoldersAction:3"],
        contentType: "jnt:contentFolder",
        hideOnNodeTypes: ["jnt:page"]
    });
    actionsRegistry.add('createContent', createContentAction, {
        buttonLabel: "label.contentManager.create.content",
        target: ["createMenuActions:3.1", "contentTreeMenuActions:3.1", "contextualMenuFoldersAction:3.1"],
        hideOnNodeTypes: ["jnt:page", "jnt:folder"],
        baseContentType: Constants.contentType,
    });
    actionsRegistry.add('createFolder', createContentOfTypeAction, {
        buttonLabel: "label.contentManager.create.folder",
        target: ["createMenuActions:3", "contentTreeMenuActions:3", "contextualMenuFilesAction:3"],
        contentType: "jnt:folder",
        hideOnNodeTypes: ["jnt:page"],
    });
    actionsRegistry.add('fileUpload',  fileUploadAction, {
        buttonLabel: "label.contentManager.fileUpload.uploadButtonLabel",
        target: ["createMenuActions:4", "contentTreeMenuActions:4", "contextualMenuFilesAction:4"],
        requiredPermission: "jcr:addChildNodes",
        hideOnNodeTypes: ["jnt:page", "jnt:contentFolder"]
    });
    actionsRegistry.add('translate', {
        buttonIcon: <Edit/>,
        buttonLabel: "label.contentManager.contentPreview.translate",
        target: []
    });
    actionsRegistry.add('tableMenuActions',  menuAction, {
        buttonIcon: <Menu/>,
        buttonLabel: "label.contentManager.contentPreview.edit",
        target: ["tableActions:2.5"],
        menu: "tableMenuActions"
    });
    actionsRegistry.add('contentTreeActions', menuAction, {
        buttonIcon: <Menu/>,
        buttonLabel: "label.contentManager.contentPreview.edit",
        target: ["contentTreeActions:2.5"],
        menu: "contentTreeMenuActions"
    });
    actionsRegistry.add('publish', publishAction, {
        buttonIcon: <Publish/>,
        buttonLabel: "label.contentManager.contentPreview.publish",
        target: ["publishMenu:1", "contentTreeMenuActions:5", "contextualMenuPagesAction:5", "contextualMenuFoldersAction:5", "contextualMenuFilesAction:5", "contextualMenuContentAction:5"],
        allSubtree: false,
        allLanguages: false,
        checkForUnpublication: false,
        checkIfLanguagesMoreThanOne: false,
        hideOnNodeTypes: ["jnt:virtualsite", "jnt:contentFolder", "nt:folder"],
    });
    actionsRegistry.add('advancedPublish', menuAction, {
        buttonIcon: <Menu/>,
        buttonLabel: "label.contentManager.contentPreview.advancedPublish",
        target: ["contentTreeMenuActions:6", "contextualMenuPagesAction:6", "contextualMenuFoldersAction:6", "contextualMenuFilesAction:6"],
        menu: "advancedPublish",
    });
    actionsRegistry.add('publishMenu',  menuAction, {
        buttonIcon: <Menu/>,
        buttonLabel: "label.contentManager.contentPreview.publishMenu",
        target: ["editPreviewBar", "thumbnailPublishMenu", "tableMenuActions"],
        menu: "publishMenu",
    });
    actionsRegistry.add('publishInAllLanguages', publishAction, {
        buttonIcon: <Publish/>,
        buttonLabel: "label.contentManager.contentPreview.publishInAllLanguages",
        target: ["publishMenu", "advancedPublish", "contextualMenuContentAction"],
        hideOnNodeTypes: ["nt:file", "jnt:contentFolder", "nt:folder"],
        allSubTree: false,
        allLanguages: true,
        checkForUnpublication: false,
        checkIfLanguagesMoreThanOne: true,
    });
    actionsRegistry.add('publishAll', publishAction, {
        buttonIcon: <Publish/>,
        buttonLabel: "label.contentManager.contentPreview.publishAll",
        target: ["advancedPublish"],
        hideOnNodeTypes: ["nt:file"],
        allSubTree: true,
        allLanguages: false,
        checkForUnpublication: false,
        checkIfLanguagesMoreThanOne: false,
    });
    actionsRegistry.add('publishAllInAllLanguages', publishAction, {
        buttonIcon: <Publish/>,
        buttonLabel: "label.contentManager.contentPreview.publishAllInAllLanguages",
        target: ["advancedPublish"],
        hideOnNodeTypes: ["nt:file"],
        allSubTree: true,
        allLanguages: true,
        checkForUnpublication: false,
        checkIfLanguagesMoreThanOne: true,
    });
    actionsRegistry.add('publishDeletion', publishDeletionAction, {
        buttonIcon: <Publish/>,
        buttonLabel: "label.contentManager.contentPreview.publishDeletion",
        target: ["editPreviewBar:4.2", "contentTreeMenuActions:4.2", "tableMenuActions:4.2", "contextualMenuFoldersAction:4.2", "contextualMenuFilesAction:4.2", "contextualMenuContentAction:4.2"],
        hideOnNodeTypes: ["jnt:virtualsite"],
    });
    actionsRegistry.add('unpublish', publishAction, {
        buttonIcon: <Publish/>,
        buttonLabel: "label.contentManager.contentPreview.unpublish",
        target: ["livePreviewBar", "publishMenu", "advancedPublish", "contextualMenuContentAction"],
        hideOnNodeTypes: ["jnt:virtualsite"],
        allSubTree: false,
        allLanguages: false,
        checkForUnpublication: true,
        checkIfLanguagesMoreThanOne: false,
    });
    actionsRegistry.add('contextualMenuContent', menuAction, {
        buttonIcon: <Menu/>,
        iconButton: true,
        menu: "contextualMenuContentAction"
    });
    actionsRegistry.add('contextualMenuFolders',  menuAction, {
        buttonIcon: <Menu/>,
        iconButton: true,
        menu: "contextualMenuFoldersAction"
    });
    actionsRegistry.add('contextualMenuPages', menuAction, {
        buttonIcon: <Menu/>,
        iconButton: true,
        menu: "contextualMenuPagesAction"
    });
    actionsRegistry.add('contextualMenuFiles',  menuAction, {
        buttonIcon: <Menu/>,
        iconButton: true,
        menu: "contextualMenuFilesAction"
    });
    actionsRegistry.add('additionalPreview', menuAction, {
        buttonIcon: <Menu/>,
        target: ["editAdditionalMenu"],
        iconButton: true,
        menu: "additionalPreviewMenu"
    });
    actionsRegistry.add('duplicate', {
        buttonIcon: <Edit/>,
        buttonLabel: "label.contentManager.contentPreview.duplicate",
        target: []
    });
    actionsRegistry.add('copy', copyAction, {
        buttonIcon: <Error/>,
        buttonLabel: "label.contentManager.contentPreview.copy",
        target: ["additionalPreviewMenu:3.8", "tableMenuActions:3.8", "contextualMenuFoldersAction:3.8", "contextualMenuFilesAction:3.8", "contextualMenuContentAction:3.8", "contentTreeMenuActions:3.8"],
        hideOnNodeTypes: ["jnt:page"],
        showForPaths: ["\/sites\/.+?\/files\/*", "\/sites\/.+?\/contents\/*"]
    });
    actionsRegistry.add('pasteFile', pasteAction, {
        buttonIcon: <Error/>,
        buttonLabel: "label.contentManager.contentPreview.paste",
        target: ["contextualMenuFilesAction:3.8", "contentTreeMenuActions:3.8", "copyPasteActions:3.8"],
        hideOnNodeTypes: ["jnt:page", "jnt:contentFolder"],
        baseContentType: "jnt:file"
    });
    // pasteFolder: {
    //     priority: 3.9,
    //     component: PasteAction,
    //     buttonIcon: <Paste/>,
    //     target: ["contextualMenuFilesAction", "contentTreeMenuActions", "copyPasteActions"],
    //     requiredPermission: "jcr:addChildNodes",
    //     labelKey: "label.contentManager.contentPreview.paste",
    //     hideOnNodeTypes: ["jnt:page", "jnt:contentFolder"],
    //     baseContentType: "jnt:folder"
    // },
    // pasteContentFolder: {
    //     priority: 3.9,
    //     component: PasteAction,
    //     buttonIcon: <Paste/>,
    //     target: ["contextualMenuFoldersAction", "contentTreeMenuActions", "copyPasteActions"],
    //     requiredPermission: "jcr:addChildNodes",
    //     labelKey: "label.contentManager.contentPreview.paste",
    //     hideOnNodeTypes: ["jnt:page", "jnt:folder"],
    //     baseContentType: "jnt:contentFolder"
    // },
    actionsRegistry.add('pasteContentFolderContent', pasteAction, {
        buttonIcon: <Error/>,
        buttonLabel: "label.contentManager.contentPreview.paste",
        target: ["contextualMenuFoldersAction:3.9", "contentTreeMenuActions:3.9", "copyPasteActions:3.9"],
        hideOnNodeTypes: ["jnt:page", "jnt:folder"],
        baseContentType: "jmix:editorialContent"
    });
    actionsRegistry.add('cut', copyAction, {
        buttonIcon: <Error/>,
        buttonLabel: "label.contentManager.contentPreview.cut",
        target: ["additionalPreviewMenu:3.9", "tableMenuActions:3.9", "contextualMenuFoldersAction:3.9", "contextualMenuFilesAction:3.9", "contextualMenuContentAction:3.9", "contentTreeMenuActions:3.9"],
        hideOnNodeTypes: ["jnt:page"],
        showForPaths: ["\/sites\/.+?\/files\/*", "\/sites\/.+?\/contents\/*"]
    });
    actionsRegistry.add('delete', deleteAction, {
        buttonIcon: <Delete/>,
        buttonLabel: "label.contentManager.contentPreview.delete",
        target: ["contentTreeMenuActions:4", "tableMenuActions:4", "additionalPreviewMenu:4", "contextualMenuFoldersAction:4", "contextualMenuFilesAction:4", "contextualMenuContentAction:4"],
        hideOnNodeTypes: ["jnt:page"]
    });
    actionsRegistry.add('deletePermanently', deletePermanentlyAction, {
        buttonIcon: <Delete/>,
        buttonLabel: "label.contentManager.contentPreview.deletePermanently",
        target: ["contentTreeMenuActions:4", "tableMenuActions:4", "additionalPreviewMenu:4", "contextualMenuFoldersAction:4", "contextualMenuFilesAction:4", "contextualMenuContentAction:4"],
        hideOnNodeTypes: ["jnt:page"]
    });
    actionsRegistry.add('undelete', undeleteAction, {
        buttonIcon: <Delete/>,
        buttonLabel: "label.contentManager.contentPreview.undelete",
        target: ["contentTreeMenuActions:4.1", "tableMenuActions:4.1", "additionalPreviewMenu:4.1", "contextualMenuFoldersAction:4.1", "contextualMenuFilesAction:4.1", "contextualMenuContentAction:4.1"],
        hideOnNodeTypes: ["jnt:page"]
    });
    actionsRegistry.add('createMenu', requirementsAction, menuAction, {
        buttonIcon: <Add/>,
        buttonLabel: "label.contentManager.create.create",
        hideOnNodeTypes: ["jnt:page"],
        init: (context) => context.initRequirements({requiredPermission: "jcr:addChildNodes"}),
        menu: "createMenuActions"
    });
    actionsRegistry.add('lock', lockManagementAction, {
        buttonLabel: 'label.contentManager.contextMenu.lockActions.lock',
        target: ["contentTreeMenuActions:5", "contextualMenuFoldersAction:5"],
        showOnNodeTypes: ["jnt:contentFolder"],
        action: 'lock'
    });
    actionsRegistry.add('unlock', lockManagementAction, {
        buttonLabel: 'label.contentManager.contextMenu.lockActions.unlock',
        target: ["contentTreeMenuActions:5", "contextualMenuFoldersAction:5"],
        showOnNodeTypes: ["jnt:contentFolder"],
        action: 'unlock'
    });
    actionsRegistry.add('clearAllLocks',  lockManagementAction, {
        buttonLabel: 'label.contentManager.contextMenu.lockActions.clearAllLocks',
        target: ["contentTreeMenuActions:5", "contextualMenuFoldersAction:5"],
        showOnNodeTypes: ["jnt:contentFolder"],
        action: 'clearAllLocks'
    });

    actionsRegistry.add('contentLeftMenu', routerAction, {
        buttonLabel: 'label.contentManager.leftMenu.content',
        target: ["leftMenuActions:1"],
        customIcon: {name: 'content', viewBox: '0 0 512 512'},
        mode: "browse",
    });
    actionsRegistry.add('mediaLeftMenu', routerAction, {
        buttonLabel: 'label.contentManager.leftMenu.media',
        target: ["leftMenuActions:2"],
        customIcon: {name: 'media', viewBox: '0 0 512 512'},
        mode: "browse-files",
    });
    /*
    savedSearchesLeftMenu: {
        priority : 3.0,
        component: "sideMenuAction",
        menuId : "leftMenuSavedSearchActions",
        target: ["leftMenuActions"],
        labelKey: 'label.contentManager.leftMenu.savedSearches',
    },
    */
    actionsRegistry.add('manageLeftMenu', sideMenuAction, {
        buttonLabel: 'label.contentManager.leftMenu.manage.title',
        // buttonIcon: <Error/>,
        target: ["leftMenuActions:5"],
        customIcon: {name: 'manage'},
        menu: "leftMenuManageActions",
        hasChildren: true
    });
    // actionsRegistry.add('bottomLeftMenu', {
    //     component: "sideMenuAction",
    //     // buttonIcon: <Error/>,
    //     menuId: "bottomLeftMenuActions",
    //     target: ["bottomLeftMenu"],
    //     requiredPermission: "",
    //     buttonLabel: 'label.contentManager.bottomLeftMenu'
    // });
    actionsRegistry.add('workflowsLeftMenu', workflowDashboardAction, {
        buttonLabel: 'label.contentManager.leftMenu.workflow',
        customIcon: {name: 'workflow', viewBox: '0 0 512 512'},
        target: ["leftMenuBottomActions:6"]
    });
    actionsRegistry.add('groups', routerAction, {
        buttonLabel: 'label.contentManager.leftMenu.manage.groups.title',
        target: ["leftMenuManageActions:10"],
        icon: 'users',
        mode: "apps",
        iframeUrl: ":context/cms/:frame/:workspace/:lang/sites/:site.manageGroups.html",
        requiredPermission: "siteAdminGroups"
    });
    actionsRegistry.add('languages', routerAction, {
        buttonLabel: 'label.contentManager.leftMenu.manage.languages.title',
        target: ["leftMenuManageActions:20"],
        icon: 'globe',
        mode: "apps",
        iframeUrl: ":context/cms/:frame/:workspace/:lang/sites/:site.manageLanguages.html",
        requiredPermission: "siteAdminLanguages"
    });
    actionsRegistry.add('roles',  routerAction, {
        buttonLabel: 'label.contentManager.leftMenu.manage.roles.title',
        target: ["leftMenuManageActions:30"],
        icon: 'user-shield',
        mode: "apps",
        iframeUrl: ":context/cms/:frame/:workspace/:lang/sites/:site.manageSiteRoles.html",
        requiredPermission: "siteAdminSiteRoles"
    });
    actionsRegistry.add('users', routerAction, {
        buttonLabel: 'label.contentManager.leftMenu.manage.users.title',
        target: ["leftMenuManageActions:40"],
        icon: 'user',
        mode: "apps",
        iframeUrl: ":context/cms/:frame/:workspace/:lang/sites/:site.manageUsers.html",
        requiredPermission: "siteAdminUsers"
    });
    actionsRegistry.add('tags', routerAction, {
        buttonLabel: 'label.contentManager.leftMenu.manage.tags.title',
        target: ["leftMenuManageActions:50"],
        icon: 'tags',
        mode: "apps",
        iframeUrl: ":context/cms/:frame/:workspace/:lang/sites/:site.tagsManager.html",
        requiredPermission: "tagManager"
    });


};

export default initActions;