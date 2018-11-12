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
        target: ["editPreviewBar:2.5", "contentTreeMenuActions:2.5", "tableActions:2", "contextualMenuPagesAction:2.5", "contextualMenuFoldersAction:2.5", "contextualMenuFilesAction:2.5", "contextualMenuContentAction:2.5"],
        buttonLabel: "label.contentManager.contentPreview.edit"
    });
    actionsRegistry.add('preview', previewAction, {
        buttonIcon: <Visibility/>,
        target: ["tableActions:1"],
        buttonLabel: "label.contentManager.contentPreview.preview"
    });
    actionsRegistry.add('createContentFolder', createContentOfTypeAction, {
        target: ["createMenuActions:3", "contentTreeMenuActions:3", "contextualMenuFoldersAction:3"],
        contentType: "jnt:contentFolder",
        requiredPermission: "jcr:addChildNodes",
        buttonLabel: "label.contentManager.create.contentFolder",
        hideOnNodeTypes: ["jnt:page"]
    });
    actionsRegistry.add('createContent', createContentAction, {
        target: ["createMenuActions:3.1", "contentTreeMenuActions:3.1", "contextualMenuFoldersAction:3.1"],
        requiredPermission: "jcr:addChildNodes",
        buttonLabel: "label.contentManager.create.content",
        hideOnNodeTypes: ["jnt:page", "jnt:folder"],
        baseContentType: Constants.contentType,
    });
    actionsRegistry.add('createFolder', createContentOfTypeAction, {
        target: ["createMenuActions:3", "contentTreeMenuActions:3", "contextualMenuFilesAction:3"],
        contentType: "jnt:folder",
        requiredPermission: "jcr:addChildNodes",
        buttonLabel: "label.contentManager.create.folder",
        hideOnNodeTypes: ["jnt:page"],
    });
    actionsRegistry.add('fileUpload',requirementsAction,  fileUploadAction, {
        target: ["createMenuActions:4", "contentTreeMenuActions:4", "contextualMenuFilesAction:4"],
        requiredPermission: "jcr:addChildNodes",
        buttonLabel: "label.contentManager.fileUpload.uploadButtonLabel",
        hideOnNodeTypes: ["jnt:page", "jnt:contentFolder"]
    });
    actionsRegistry.add('translate', requirementsAction, {
        onClick: () => alert("Translate !!!"),
        buttonIcon: <Edit/>,
        target: [],
        buttonLabel: "label.contentManager.contentPreview.translate"
    });
    actionsRegistry.add('tableMenuActions',requirementsAction,  menuAction, {
        menu: "tableMenuActions",
        buttonIcon: <Menu/>,
        target: ["tableActions:2.5"],
        buttonLabel: "label.contentManager.contentPreview.edit"
    });
    actionsRegistry.add('contentTreeActions', requirementsAction, menuAction, {
        menu: "contentTreeMenuActions",
        buttonIcon: <Menu/>,
        target: ["contentTreeActions:2.5"],
        buttonLabel: "label.contentManager.contentPreview.edit"
    });
    actionsRegistry.add('publish', publishAction, {
        buttonIcon: <Publish/>,
        target: ["publishMenu:1", "contentTreeMenuActions:5", "contextualMenuPagesAction:5", "contextualMenuFoldersAction:5", "contextualMenuFilesAction:5", "contextualMenuContentAction:5"],
        buttonLabel: "label.contentManager.contentPreview.publish",
        allSubtree: false,
        allLanguages: false,
        checkForUnpublication: false,
        checkIfLanguagesMoreThanOne: false,
        hideOnNodeTypes: ["jnt:virtualsite", "jnt:contentFolder", "nt:folder"],
        retrieveProperties: {retrievePropertiesNames: ["jcr:mixinTypes"]},
        retrieveSiteLanguages:true
    });
    actionsRegistry.add('advancedPublish', requirementsAction, menuAction, {
        menu: "advancedPublish",
        buttonIcon: <Menu/>,
        target: ["contentTreeMenuActions:6", "contextualMenuPagesAction:6", "contextualMenuFoldersAction:6", "contextualMenuFilesAction:6"],
        buttonLabel: "label.contentManager.contentPreview.advancedPublish",
        retrieveSiteLanguages:true
    });
    actionsRegistry.add('publishMenu', requirementsAction,  menuAction, {
        menu: "publishMenu",
        buttonIcon: <Menu/>,
        target: ["editPreviewBar", "thumbnailPublishMenu", "tableMenuActions"],
        buttonLabel: "label.contentManager.contentPreview.publishMenu",
    });
    actionsRegistry.add('publishInAllLanguages', publishAction, {
        buttonIcon: <Publish/>,
        target: ["publishMenu", "advancedPublish", "contextualMenuContentAction"],
        allSubTree: false,
        allLanguages: true,
        checkForUnpublication: false,
        hideOnNodeTypes: ["nt:file", "jnt:contentFolder", "nt:folder"],
        checkIfLanguagesMoreThanOne: true,
        buttonLabel: "label.contentManager.contentPreview.publishInAllLanguages",
        retrieveProperties: {retrievePropertiesNames: ["jcr:mixinTypes"]},
        retrieveSiteLanguages:true
    });
    actionsRegistry.add('publishAll', publishAction, {
        buttonIcon: <Publish/>,
        target: ["advancedPublish"],
        allSubTree: true,
        allLanguages: false,
        checkForUnpublication: false,
        checkIfLanguagesMoreThanOne: false,
        hideOnNodeTypes: ["nt:file"],
        buttonLabel: "label.contentManager.contentPreview.publishAll",
        retrieveProperties: {retrievePropertiesNames: ["jcr:mixinTypes"]},
        retrieveSiteLanguages:true
    });
    actionsRegistry.add('publishAllInAllLanguages', publishAction, {
        buttonIcon: <Publish/>,
        target: ["advancedPublish"],
        allSubTree: true,
        allLanguages: true,
        checkForUnpublication: false,
        hideOnNodeTypes: ["nt:file"],
        checkIfLanguagesMoreThanOne: true,
        buttonLabel: "label.contentManager.contentPreview.publishAllInAllLanguages",
        retrieveProperties: {retrievePropertiesNames: ["jcr:mixinTypes"]},
        retrieveSiteLanguages:true
    });
    actionsRegistry.add('publishDeletion', publishDeletionAction, {
        buttonIcon: <Publish/>,
        target: ["editPreviewBar:4.2", "contentTreeMenuActions:4.2", "tableMenuActions:4.2", "contextualMenuFoldersAction:4.2", "contextualMenuFilesAction:4.2", "contextualMenuContentAction:4.2"],
        buttonLabel: "label.contentManager.contentPreview.publishDeletion",
        hideOnNodeTypes: ["jnt:virtualsite"],
        retrieveProperties: {retrievePropertiesNames: ["jcr:mixinTypes"]}
    });
    actionsRegistry.add('unpublish', publishAction, {
        buttonIcon: <Publish/>,
        target: ["livePreviewBar", "publishMenu", "advancedPublish", "contextualMenuContentAction"],
        allSubTree: false,
        allLanguages: false,
        checkForUnpublication: true,
        checkIfLanguagesMoreThanOne: false,
        hideOnNodeTypes: ["jnt:virtualsite"],
        buttonLabel: "label.contentManager.contentPreview.unpublish",
        retrieveSiteLanguages:true
    });
    actionsRegistry.add('contextualMenuContent', requirementsAction, menuAction, {
        menu: "contextualMenuContentAction",
        buttonIcon: <Menu/>,
        iconButton: true
    });
    actionsRegistry.add('contextualMenuFolders',requirementsAction,  menuAction, {
        menu: "contextualMenuFoldersAction",
        buttonIcon: <Menu/>,
        iconButton: true
    });
    actionsRegistry.add('contextualMenuPages', requirementsAction, menuAction, {
        menu: "contextualMenuPagesAction",
        buttonIcon: <Menu/>,
        iconButton: true
    });
    actionsRegistry.add('contextualMenuFiles',requirementsAction,  menuAction, {
        menu: "contextualMenuFilesAction",
        buttonIcon: <Menu/>,
        iconButton: true
    });
    actionsRegistry.add('additionalPreview', requirementsAction, menuAction, {
        menu: "additionalPreviewMenu",
        buttonIcon: <Menu/>,
        target: ["editAdditionalMenu"],
        iconButton: true
    });
    actionsRegistry.add('duplicate', {
        onClick: () => alert("not implemented yet"),
        buttonIcon: <Edit/>,
        target: [],
        buttonLabel: "label.contentManager.contentPreview.duplicate"
    });
    actionsRegistry.add('copy', copyAction, {
        priority: 3.8,
        buttonIcon: <Error/>,
        target: ["additionalPreviewMenu", "tableMenuActions", "contextualMenuFoldersAction", "contextualMenuFilesAction", "contextualMenuContentAction", "contentTreeMenuActions"],
        requiredPermission: "jcr:addChildNodes",
        buttonLabel: "label.contentManager.contentPreview.copy",
        hideOnNodeTypes: ["jnt:page"],
        showForPaths: ["\/sites\/.+?\/files\/*", "\/sites\/.+?\/contents\/*"]
    });
    actionsRegistry.add('pasteFile', pasteAction, {
        buttonIcon: <Error/>,
        target: ["contextualMenuFilesAction:3.8", "contentTreeMenuActions:3.8", "copyPasteActions:3.8"],
        requiredPermission: "jcr:addChildNodes",
        buttonLabel: "label.contentManager.contentPreview.paste",
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
        target: ["contextualMenuFoldersAction:3.9", "contentTreeMenuActions:3.9", "copyPasteActions:3.9"],
        requiredPermission: "jcr:addChildNodes",
        buttonLabel: "label.contentManager.contentPreview.paste",
        hideOnNodeTypes: ["jnt:page", "jnt:folder"],
        baseContentType: "jmix:editorialContent"
    });
    actionsRegistry.add('cut', copyAction, {
        buttonIcon: <Error/>,
        target: ["additionalPreviewMenu:3.9", "tableMenuActions:3.9", "contextualMenuFoldersAction:3.9", "contextualMenuFilesAction:3.9", "contextualMenuContentAction:3.9", "contentTreeMenuActions:3.9"],
        requiredPermission: "jcr:removeNode",
        buttonLabel: "label.contentManager.contentPreview.cut",
        hideOnNodeTypes: ["jnt:page"],
        showForPaths: ["\/sites\/.+?\/files\/*", "\/sites\/.+?\/contents\/*"]
    });
    actionsRegistry.add('delete', deleteAction, {
        buttonIcon: <Delete/>,
        target: ["contentTreeMenuActions:4", "tableMenuActions:4", "additionalPreviewMenu:4", "contextualMenuFoldersAction:4", "contextualMenuFilesAction:4", "contextualMenuContentAction:4"],
        retrieveProperties: {retrievePropertiesNames: ["jcr:mixinTypes"]},
        requiredPermission: "jcr:removeNode",
        buttonLabel: "label.contentManager.contentPreview.delete",
        hideOnNodeTypes: ["jnt:page"]
    });
    actionsRegistry.add('deletePermanently', deletePermanentlyAction, {
        buttonIcon: <Delete/>,
        target: ["contentTreeMenuActions:4", "tableMenuActions:4", "additionalPreviewMenu:4", "contextualMenuFoldersAction:4", "contextualMenuFilesAction:4", "contextualMenuContentAction:4"],
        retrieveProperties: {retrievePropertiesNames: ["jcr:mixinTypes"]},
        requiredPermission: "jcr:removeNode",
        buttonLabel: "label.contentManager.contentPreview.deletePermanently",
        hideOnNodeTypes: ["jnt:page"]
    });
    actionsRegistry.add('undelete', undeleteAction, {
        buttonIcon: <Delete/>,
        target: ["contentTreeMenuActions:4.1", "tableMenuActions:4.1", "additionalPreviewMenu:4.1", "contextualMenuFoldersAction:4.1", "contextualMenuFilesAction:4.1", "contextualMenuContentAction:4.1"],
        retrieveProperties: {retrievePropertiesNames: ["jcr:mixinTypes"]},
        requiredPermission: "jcr:removeNode",
        buttonLabel: "label.contentManager.contentPreview.undelete",
        hideOnNodeTypes: ["jnt:page"]
    });
    actionsRegistry.add('createMenu', menuAction, {
        menu: "createMenuActions",
        buttonIcon: <Add/>,
        requiredPermission: "jcr:addChildNodes",
        buttonLabel: "label.contentManager.create.create",
        hideOnNodeTypes: ["jnt:page"]
    });
    actionsRegistry.add('lock', lockManagementAction, {
        action: 'lock',
        target: ["contentTreeMenuActions:5", "contextualMenuFoldersAction:5"],
        retrieveProperties: {retrievePropertiesNames: ["j:lockTypes"]},
        requiredPermission: "jcr:lockManagement",
        buttonLabel: 'label.contentManager.contextMenu.lockActions.lock',
        showOnNodeTypes: ["jnt:contentFolder"]
    });
    actionsRegistry.add('unlock', lockManagementAction, {
        action: 'unlock',
        target: ["contentTreeMenuActions:5", "contextualMenuFoldersAction:5"],
        requiredPermission: "jcr:lockManagement",
        retrieveProperties: {retrievePropertiesNames: ["j:lockTypes"]},
        buttonLabel: 'label.contentManager.contextMenu.lockActions.unlock',
        showOnNodeTypes: ["jnt:contentFolder"]
    });
    actionsRegistry.add('clearAllLocks',  lockManagementAction, {
        action: 'clearAllLocks',
        target: ["contentTreeMenuActions:5", "contextualMenuFoldersAction:5"],
        requiredPermission: "jcr:lockManagement",
        retrieveProperties: {retrievePropertiesNames: ["j:lockTypes"]},
        buttonLabel: 'label.contentManager.contextMenu.lockActions.clearAllLocks',
        showOnNodeTypes: ["jnt:contentFolder"]
    });

    actionsRegistry.add('contentLeftMenu', routerAction, {
        mode: "browse",
        customIcon: {name: 'content', viewBox: '0 0 512 512'},
        // buttonIcon: <Error/>,
        target: ["leftMenuActions:1"],
        buttonLabel: 'label.contentManager.leftMenu.content',
    });
    actionsRegistry.add('mediaLeftMenu', routerAction, {
        customIcon: {name: 'media', viewBox: '0 0 512 512'},
        // buttonIcon: <Error/>,
        mode: "browse-files",
        target: ["leftMenuActions:2"],
        buttonLabel: 'label.contentManager.leftMenu.media',
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
        customIcon: {name: 'manage'},
        menu: "leftMenuManageActions",
        // buttonIcon: <Error/>,
        target: ["leftMenuActions:5"],
        buttonLabel: 'label.contentManager.leftMenu.manage.title',
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
        // buttonIcon: <Error/>,
        customIcon: {name: 'workflow', viewBox: '0 0 512 512'},
        target: ["leftMenuBottomActions:6"],
        buttonLabel: 'label.contentManager.leftMenu.workflow'
    });
    actionsRegistry.add('groups', routerAction, {
        mode: "apps",
        iframeUrl: ":context/cms/:frame/:workspace/:lang/sites/:site.manageGroups.html",
        target: ["leftMenuManageActions:10"],
        requiredPermission: "siteAdminGroups",
        buttonLabel: 'label.contentManager.leftMenu.manage.groups.title',
        icon: 'users'
    });
    actionsRegistry.add('languages', routerAction, {
        mode: "apps",
        iframeUrl: ":context/cms/:frame/:workspace/:lang/sites/:site.manageLanguages.html",
        target: ["leftMenuManageActions:20"],
        requiredPermission: "siteAdminLanguages",
        buttonLabel: 'label.contentManager.leftMenu.manage.languages.title',
        icon: 'globe'
    });
    actionsRegistry.add('roles',  routerAction, {
        mode: "apps",
        iframeUrl: ":context/cms/:frame/:workspace/:lang/sites/:site.manageSiteRoles.html",
        target: ["leftMenuManageActions:30"],
        requiredPermission: "siteAdminSiteRoles",
        buttonLabel: 'label.contentManager.leftMenu.manage.roles.title',
        icon: 'user-shield'
    });
    actionsRegistry.add('users', routerAction, {
        mode: "apps",
        iframeUrl: ":context/cms/:frame/:workspace/:lang/sites/:site.manageUsers.html",
        target: ["leftMenuManageActions:40"],
        requiredPermission: "siteAdminUsers",
        buttonLabel: 'label.contentManager.leftMenu.manage.users.title',
        icon: 'user'
    });
    actionsRegistry.add('tags', routerAction, {
        mode: "apps",
        iframeUrl: ":context/cms/:frame/:workspace/:lang/sites/:site.tagsManager.html",
        target: ["leftMenuManageActions:50"],
        requiredPermission: "tagManager",
        buttonLabel: 'label.contentManager.leftMenu.manage.tags.title',
        icon: 'tags'
    });


};

export default initActions;