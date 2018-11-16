import React from "react";
import {actionsRegistry, menuAction} from "@jahia/react-material";
import {Add, Delete, Edit, Error, Menu, Publish, Visibility, Lock, LockOpen, Autorenew} from "@material-ui/icons";
import {ContentPaste} from "mdi-material-ui";
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
import cutAction from './cutAction'
import lockAction from './lockAction'
import workflowDashboardAction from './workflowDashboardAction';
import {routerAction} from "./routerAction";
import sideMenuAction from "./sideMenuAction";
import sideMenuListAction from "./sideMenuListAction";
import openInEditModeAction from "./openInEditModeAction";
import unlockAction from "./unlockAction";
import clearAllLocksAction from "./clearAllLocksAction";
import menuWithRequirementsAction from './menuWithRequirementsAction';

function initActions(actionsRegistry) {
    actionsRegistry.add('router', routerAction);
    actionsRegistry.add('sideMenu', sideMenuAction);
    actionsRegistry.add('sideMenuList', sideMenuListAction);

    actionsRegistry.add('edit', editAction, {
        buttonIcon: <Edit/>,
        buttonLabel: "label.contentManager.contentPreview.edit",
        target: ["editPreviewBar:2.5", "contentTreeMenuActions:2.5", "tableActions:2", "contextualMenuContentAction:2.5"]
    });
    actionsRegistry.add('preview', previewAction, {
        buttonIcon: <Visibility/>,
        buttonLabel: 'label.contentManager.contentPreview.preview',
        target: ['tableActions:1', 'thumbnailActions:2']
    });
    actionsRegistry.add('createContentFolder', createContentOfTypeAction, {
        buttonLabel: "label.contentManager.create.contentFolder",
        target: ["createMenuActions:3", "contentTreeMenuActions:3", "tableMenuActions:2"],
        contentType: "jnt:contentFolder",
        showOnNodeTypes: ["jnt:contentFolder"]
    });
    actionsRegistry.add('createContent', createContentAction, {
        buttonLabel: "label.contentManager.create.content",
        target: ["createMenuActions:3.1", "contentTreeMenuActions:3.1", "tableMenuActions:3"],
        showOnNodeTypes: ["jnt:contentFolder"],
        baseContentType: Constants.contentType,
    });
    actionsRegistry.add('createFolder', createContentOfTypeAction, {
        buttonLabel: "label.contentManager.create.folder",
        target: ["createMenuActions:3", "contentTreeMenuActions:3"],
        contentType: "jnt:folder",
    });
    actionsRegistry.add('fileUpload',  fileUploadAction, {
        buttonLabel: "label.contentManager.fileUpload.uploadButtonLabel",
        target: ["createMenuActions:4", "contentTreeMenuActions:4"],
        contentType: "jnt:folder",
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
        target: ["publishMenu:1", "contentTreeMenuActions:5", "contextualMenuContentAction:5", "tableMenuActions:1"],
        allSubtree: false,
        allLanguages: false,
        checkForUnpublication: false,
        checkIfLanguagesMoreThanOne: false,
        hideOnNodeTypes: ["jnt:virtualsite", "jnt:contentFolder", "nt:folder"],
    });
    actionsRegistry.add('advancedPublish', menuAction, {
        buttonIcon: <Menu/>,
        buttonLabel: "label.contentManager.contentPreview.advancedPublish",
        target: ["contentTreeMenuActions:6", "tableMenuActions:2.5"],
        menu: "advancedPublish",
    });
    actionsRegistry.add('publishMenu',  menuWithRequirementsAction, {
        buttonIcon: <Autorenew/>,
        buttonLabel: 'label.contentManager.contentPreview.publishMenu',
        target: ['editPreviewBar', 'thumbnailActions:1', 'tableMenuActions'],
        hideOnNodeTypes: ['jnt:contentFolder', 'jnt:page'],
        menu: 'publishMenu',
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
        target: ["editPreviewBar:4.2", "contentTreeMenuActions:4.2", "tableMenuActions:4.2","contextualMenuContentAction:4.2"],
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
        target: ["additionalPreviewMenu:3.8", "tableMenuActions:3.8", "contextualMenuContentAction:3.8", "contentTreeMenuActions:3.8", "tableMenuActions:3"],
        hideOnNodeTypes: ["jnt:page"]
    });
    actionsRegistry.add('paste', pasteAction, {
        buttonIcon: <ContentPaste/>,
        buttonLabel: "label.contentManager.contentPreview.paste",
        target: ["contentTreeMenuActions:3.8", "copyPasteActions:3.8", "tableHeaderActions:1"],
        hideOnNodeTypes: ["jnt:page"],
        showForPaths: ["\/sites\/.+?\/files\/*", "\/sites\/.+?\/contents\/*"]
    });
    actionsRegistry.add('cut', cutAction, {
        buttonIcon: <Error/>,
        buttonLabel: "label.contentManager.contentPreview.cut",
        target: ["additionalPreviewMenu:3.9", "tableMenuActions:3.9", "contextualMenuContentAction:3.9", "contentTreeMenuActions:3.9", "tableMenuActions:4"],
        hideOnNodeTypes: ["jnt:page"],
        showForPaths: ["\/sites\/.+?\/files\/*", "\/sites\/.+?\/contents\/*"]
    });
    actionsRegistry.add('delete', deleteAction, {
        buttonIcon: <Delete/>,
        buttonLabel: "label.contentManager.contentPreview.delete",
        target: ["contentTreeMenuActions:4", "tableMenuActions:4", "additionalPreviewMenu:4", "contextualMenuContentAction:4", "tableMenuActions:4.5"],
        hideOnNodeTypes: ["jnt:page"],
        showForPaths: ["\/sites\/.+?\/files\/*", "\/sites\/.+?\/contents\/*"]
    });
    actionsRegistry.add('deletePermanently', deletePermanentlyAction, {
        buttonIcon: <Delete/>,
        buttonLabel: "label.contentManager.contentPreview.deletePermanently",
        target: ["contentTreeMenuActions:4", "tableMenuActions:4", "additionalPreviewMenu:4", "contextualMenuContentAction:4"],
        hideOnNodeTypes: ["jnt:page"]
    });
    actionsRegistry.add('undelete', undeleteAction, {
        buttonIcon: <Delete/>,
        buttonLabel: "label.contentManager.contentPreview.undelete",
        target: ["contentTreeMenuActions:4.1", "tableMenuActions:4.1", "additionalPreviewMenu:4.1", "contextualMenuContentAction:4.1"],
        hideOnNodeTypes: ["jnt:page"]
    });
    actionsRegistry.add('createMenu', menuWithRequirementsAction, {
        buttonIcon: <Add/>,
        buttonLabel: "label.contentManager.create.create",
        target:["tableHeaderActions:10"],
        hideOnNodeTypes: ["jnt:page"],
        requiredPermission: "jcr:addChildNodes",
        menu: "createMenuActions"
    });
    actionsRegistry.add('lock', lockAction, {
        buttonLabel: 'label.contentManager.contextMenu.lockActions.lock',
        target: ["contentTreeMenuActions:5", "previewFooterActions", "tableMenuActions:5"],
        showOnNodeTypes: ["jnt:contentFolder", "jnt:content", "jnt:folder"],
        buttonIcon: <LockOpen/>
    });
    actionsRegistry.add('unlock', unlockAction, {
        buttonLabel: 'label.contentManager.contextMenu.lockActions.unlock',
        target: ["contentTreeMenuActions:5", "previewFooterActions", "tableMenuActions:5"],
        showOnNodeTypes: ["jnt:contentFolder", "jnt:content", "jnt:folder"],
        buttonIcon: <Lock/>
    });
    actionsRegistry.add('clearAllLocks',  clearAllLocksAction, {
        buttonLabel: 'label.contentManager.contextMenu.lockActions.clearAllLocks',
        target: ["contentTreeMenuActions:5", "tableMenuActions:5.5", "jnt:folder"],
        showOnNodeTypes: ["jnt:contentFolder", "jnt:folder"],
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
    actionsRegistry.add('openInEditMode', openInEditModeAction, {
        buttonLabel: 'label.contentManager.actions.openInEditMode',
        buttonIcon: <Edit/>,
        target: [ 'contentTreeMenuActions', 'contextualMenuContentAction', "tableMenuActions:3" ],
    });

}

export default initActions;