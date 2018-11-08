import React from "react";
import {actionsRegistry, menuAction, reduxAction} from "@jahia/react-material";
import {Edit, Publish, Error, Delete, Visibility, Menu} from "@material-ui/icons";
import Constants from "../constants";
import createContentOfTypeAction from './createContentOfTypeAction'
import createContentAction from './createContentAction'
import fileUploadAction from './fileUploadAction'
import deleteAction from './undeleteAction'
import deletePermanentlyAction from './deletePermanentlyAction'
import undeleteAction from './undeleteAction'
import publishAction from './publishAction'
import publishDeletionAction from './publishDeletionAction'
import pasteAction from './pasteAction'
import copyAction from './copyAction'
import lockManagementAction from './lockManagementAction'
import workflowDashboardAction from './workflowDashboardAction';
import {TableCell} from "@material-ui/core";
import * as _ from "lodash";
import {CM_PREVIEW_STATES, cmGoto, cmSetPreviewState} from "../redux/actions";
import {routerAction} from "./routerAction";
import sideMenuAction from "./sideMenuAction";


let edit = (context) => window.parent.authoringApi.editContent(context.path, context.displayName, ["jnt:content"], [context.primaryNodeType], context.uuid, false);
let createContentFolder = (context) => window.parent.authoringApi.createContent(context.path, ["jnt:contentFolder"], false);
let createFolder = (context) => window.parent.authoringApi.createContent(context.path, ["jnt:folder"], false);
let createContent = (context) => window.parent.authoringApi.createContent(context.path, context.nodeTypes, context.includeSubTypes);
let publish = (context) => window.parent.authoringApi.openPublicationWorkflow(context.uuid, context.allSubTree, context.allLanguages, context.checkForUnpublication);

function initActions(actionsRegistry) {
    actionsRegistry.add('edit', {
        onClick: edit,
        buttonIcon: <Edit/>,
        target: ["editPreviewBar:2.5", "contentTreeMenuActions:2.5", "tableActions:2", "contextualMenuPagesAction:2.5", "contextualMenuFoldersAction:2.5", "contextualMenuFilesAction:2.5", "contextualMenuContentAction:2.5"],
        requiredPermission: "",
        buttonLabel: "label.contentManager.contentPreview.edit"
    });
    actionsRegistry.add('preview', reduxAction((state) => ({selection: state.selection, previewState: state.previewState}),(dispatch) => ({setPreviewState: (state) => dispatch(cmSetPreviewState(state))})), {
        onClick: (context) => {
            let {previewState, setPreviewState, selection, force} = context;
            if (force !== undefined) {
                setPreviewState(force);
            } else if (!_.isEmpty(selection)) {
                switch (previewState) {
                    case CM_PREVIEW_STATES.SHOW:
                        setPreviewState(CM_PREVIEW_STATES.HIDE);
                        break;
                    case CM_PREVIEW_STATES.HIDE: {
                        setPreviewState(CM_PREVIEW_STATES.SHOW);
                        break;
                    }
                }
            }
        },
        force: CM_PREVIEW_STATES.SHOW,
        buttonIcon: <Visibility/>,
        target: ["tableActions:1"],
        requiredPermission: "",
        buttonLabel: "label.contentManager.contentPreview.preview"
    });

    actionsRegistry.add('createContentFolder', createContentOfTypeAction, {
        onClick: createContentFolder,
        target: ["createMenuActions:3", "contentTreeMenuActions:3", "contextualMenuFoldersAction:3"],
        contentType: "jnt:contentFolder",
        requiredPermission: "jcr:addChildNodes",
        buttonLabel: "label.contentManager.create.contentFolder",
        hideOnNodeTypes: ["jnt:page"]
    });
    actionsRegistry.add('createContent', createContentAction, {
        onClick: createContent,
        target: ["createMenuActions:3.1", "contentTreeMenuActions:3.1", "contextualMenuFoldersAction:3.1"],
        requiredPermission: "jcr:addChildNodes",
        buttonLabel: "label.contentManager.create.content",
        hideOnNodeTypes: ["jnt:page", "jnt:folder"],
        baseContentType: Constants.contentType,
    });
    actionsRegistry.add('createFolder', createContentOfTypeAction, {
        call: createFolder,
        target: ["createMenuActions:3", "contentTreeMenuActions:3", "contextualMenuFilesAction:3"],
        contentType: "jnt:folder",
        requiredPermission: "jcr:addChildNodes",
        buttonLabel: "label.contentManager.create.folder",
        hideOnNodeTypes: ["jnt:page"],
    });
    actionsRegistry.add('fileUpload', fileUploadAction, {
        priority: 4,
        target: ["createMenuActions", "contentTreeMenuActions", "contextualMenuFilesAction"],
        requiredPermission: "jcr:addChildNodes",
        buttonLabel: "label.contentManager.fileUpload.uploadButtonLabel",
        hideOnNodeTypes: ["jnt:page", "jnt:contentFolder"]
    });
    actionsRegistry.add('translate', {
        priority: 2.51,
        onClick: () => alert("Translate !!!"),
        buttonIcon: <Edit/>,
        target: [],
        requiredPermission: "",
        buttonLabel: "label.contentManager.contentPreview.translate"
    });
    actionsRegistry.add('tableMenuActions', menuAction, {
        priority: 2.5,
        menu: "tableMenuActions",
        buttonIcon: <Menu/>,
        target: ["tableActions"],
        requiredPermission: "",
        buttonLabel: "label.contentManager.contentPreview.edit"
    });
    actionsRegistry.add('contentTreeActions', menuAction, {
        priority: 2.5,
        menu: "contentTreeMenuActions",
        target: ["contentTreeActions"],
        requiredPermission: "",
        buttonLabel: "label.contentManager.contentPreview.edit"
    });
    actionsRegistry.add('publish', publishAction, {
        priority: 1,
        onClick: publish,
        buttonIcon: <Publish/>,
        target: ["publishMenu", "publishTableMenu"],
        requiredPermission: "",
        buttonLabel: "label.contentManager.contentPreview.publish",
        buttonLabelParams: {displayName:'toto', language:'fr'},
        allSubtree: false,
        allLanguages: false,
        checkForUnpublication: false,
        checkIfLanguagesMoreThanOne: false,
        hideOnNodeTypes: ["jnt:virtualsite", "jnt:contentFolder", "jnt:folder"],
        retrieveProperties: {retrievePropertiesNames: ["jcr:mixinTypes"]}
    });


    actionsRegistry.add('publishInContentTreeMenu', publishAction, {
        priority: 5,
        onClick: publish,
        buttonIcon: <Publish/>,
        target: ["contentTreeMenuActions", "contextualMenuPagesAction", "contextualMenuFoldersAction", "contextualMenuFilesAction", "contextualMenuContentAction"],
        requiredPermission: "",
        buttonLabel: "label.contentManager.contentPreview.publish",
        buttonLabelParams: {displayName:'toto', language:'fr'},
        allSubtree: false,
        allLanguages: false,
        checkForUnpublication: false,
        checkIfLanguagesMoreThanOne: false,
        hideOnNodeTypes: ["jnt:virtualsite", "jnt:contentFolder", "nt:folder"],
        retrieveProperties: {retrievePropertiesNames: ["jcr:mixinTypes"]}
    });
    actionsRegistry.add('advancedPublish', menuAction, {
        priority: 6,
        menu: "advancedPublish",
        buttonIcon: <Menu/>,
        target: ["contentTreeMenuActions", "contextualMenuPagesAction", "contextualMenuFoldersAction", "contextualMenuFilesAction"],
        requiredPermission: "",
        buttonLabel: "label.contentManager.contentPreview.advancedPublish",
        buttonLabelParams: {displayName:'toto', language:'fr'},
    });
    actionsRegistry.add('publishMenu', menuAction, {
        menu: "publishMenu",
        buttonIcon: <Menu/>,
        target: ["editPreviewBar", "thumbnailPublishMenu"],
        buttonLabel: "label.contentManager.contentPreview.publishMenu",
        buttonLabelParams: {displayName:'toto', language:'fr'},
    });
    actionsRegistry.add('publishTableMenu', menuAction, {
        menu: "publishTableMenu",
        buttonIcon: <Menu/>,
        target: ["tableMenuActions"],
        buttonLabel: "label.contentManager.contentPreview.publishTableMenu"
    });
    actionsRegistry.add('publishInAllLanguages', publishAction, {
        onClick: publish,
        buttonIcon: <Publish/>,
        target: ["publishMenu", "advancedPublish", "publishTableMenu", "contextualMenuContentAction"],
        requiredPermission: "",
        allSubTree: false,
        allLanguages: true,
        checkForUnpublication: false,
        hideOnNodeTypes: ["nt:file", "jnt:contentFolder", "nt:folder"],
        checkIfLanguagesMoreThanOne: true,
        buttonLabel: "label.contentManager.contentPreview.publishInAllLanguages",
        buttonLabelParams: {displayName:'toto', language:'fr'},
        retrieveProperties: {retrievePropertiesNames: ["jcr:mixinTypes"]}
    });
    actionsRegistry.add('publishAll', publishAction, {
        onClick: publish,
        buttonIcon: <Publish/>,
        target: ["advancedPublish"],
        requiredPermission: "",
        allSubTree: true,
        allLanguages: false,
        checkForUnpublication: false,
        checkIfLanguagesMoreThanOne: false,
        hideOnNodeTypes: ["nt:file"],
        buttonLabel: "label.contentManager.contentPreview.publishAll",
        buttonLabelParams: {displayName:'toto', language:'fr'},
        retrieveProperties: {retrievePropertiesNames: ["jcr:mixinTypes"]}
    });
    actionsRegistry.add('publishAllInAllLanguages', publishAction, {
        onClick: publish,
        buttonIcon: <Publish/>,
        target: ["advancedPublish"],
        requiredPermission: "",
        allSubTree: true,
        allLanguages: true,
        checkForUnpublication: false,
        hideOnNodeTypes: ["nt:file"],
        checkIfLanguagesMoreThanOne: true,
        buttonLabel: "label.contentManager.contentPreview.publishAllInAllLanguages",
        buttonLabelParams: {displayName:'toto', language:'fr'},
        retrieveProperties: {retrievePropertiesNames: ["jcr:mixinTypes"]}
    });
    actionsRegistry.add('publishDeletion', publishDeletionAction, {
        priority: 4.2,
        buttonIcon: <Publish/>,
        target: ["editPreviewBar", "contentTreeMenuActions", "tableMenuActions", "contextualMenuFoldersAction", "contextualMenuFilesAction", "contextualMenuContentAction"],
        requiredPermission: "",
        buttonLabel: "label.contentManager.contentPreview.publishDeletion",
        hideOnNodeTypes: ["jnt:virtualsite"],
        retrieveProperties: {retrievePropertiesNames: ["jcr:mixinTypes"]}
    });
    actionsRegistry.add('unpublish', publishAction, {
        onClick: publish,
        buttonIcon: <Publish/>,
        target: ["livePreviewBar", "publishMenu", "advancedPublish", "publishTableMenu", "contextualMenuContentAction"],
        requiredPermission: "",
        allSubTree: false,
        allLanguages: false,
        checkForUnpublication: true,
        checkIfLanguagesMoreThanOne: false,
        hideOnNodeTypes: ["jnt:virtualsite"],
        buttonLabel: "label.contentManager.contentPreview.unpublish",
        buttonLabelParams: {displayName:'toto', language:'fr'},
    });
    actionsRegistry.add('contextualMenuContent', menuAction, {
        menu: "contextualMenuContentAction",
        buttonIcon: <Menu/>,
        requiredPermission: "",
        iconButton: true
    });
    actionsRegistry.add('contextualMenuFolders', menuAction, {
        menu: "contextualMenuFoldersAction",
        buttonIcon: <Menu/>,
        requiredPermission: "",
        iconButton: true
    });
    actionsRegistry.add('contextualMenuPages', menuAction, {
        menu: "contextualMenuPagesAction",
        buttonIcon: <Menu/>,
        requiredPermission: "",
        iconButton: true
    });
    actionsRegistry.add('contextualMenuFiles', menuAction, {
        menu: "contextualMenuFilesAction",
        buttonIcon: <Menu/>,
        requiredPermission: "",
        iconButton: true
    });
    actionsRegistry.add('additionalPreview', menuAction, {
        menu: "additionalPreviewMenu",
        buttonIcon: <Menu/>,
        target: ["editAdditionalMenu"],
        requiredPermission: "",
        iconButton: true
    });
    actionsRegistry.add('duplicate', {
        onClick: () => alert("not implemented yet"),
        buttonIcon: <Edit/>,
        target: [],
        requiredPermission: "",
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
        priority: 3.8,
        buttonIcon: <Error/>,
        target: ["contextualMenuFilesAction", "contentTreeMenuActions", "copyPasteActions"],
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
        priority: 3.9,
        buttonIcon: <Error/>,
        target: ["contextualMenuFoldersAction", "contentTreeMenuActions", "copyPasteActions"],
        requiredPermission: "jcr:addChildNodes",
        buttonLabel: "label.contentManager.contentPreview.paste",
        hideOnNodeTypes: ["jnt:page", "jnt:folder"],
        baseContentType: "jmix:editorialContent"
    });
    actionsRegistry.add('cut', copyAction, {
        priority: 3.9,
        buttonIcon: <Error/>,
        target: ["additionalPreviewMenu", "tableMenuActions", "contextualMenuFoldersAction", "contextualMenuFilesAction", "contextualMenuContentAction", "contentTreeMenuActions"],
        requiredPermission: "jcr:removeNode",
        buttonLabel: "label.contentManager.contentPreview.cut",
        hideOnNodeTypes: ["jnt:page"],
        showForPaths: ["\/sites\/.+?\/files\/*", "\/sites\/.+?\/contents\/*"]
    });
    actionsRegistry.add('delete', deleteAction, {
        priority: 4,
        buttonIcon: <Delete/>,
        target: ["contentTreeMenuActions", "tableMenuActions", "additionalPreviewMenu", "contextualMenuFoldersAction", "contextualMenuFilesAction", "contextualMenuContentAction"],
        retrieveProperties: {retrievePropertiesNames: ["jcr:mixinTypes"]},
        requiredPermission: "jcr:removeNode",
        buttonLabel: "label.contentManager.contentPreview.delete",
        hideOnNodeTypes: ["jnt:page"]
    });
    actionsRegistry.add('deletePermanetly', deletePermanentlyAction, {
        priority: 4,
        buttonIcon: <Delete/>,
        target: ["contentTreeMenuActions", "tableMenuActions", "additionalPreviewMenu", "contextualMenuFoldersAction", "contextualMenuFilesAction", "contextualMenuContentAction"],
        retrieveProperties: {retrievePropertiesNames: ["jcr:mixinTypes"]},
        requiredPermission: "jcr:removeNode",
        buttonLabel: "label.contentManager.contentPreview.deletePermanently",
        hideOnNodeTypes: ["jnt:page"]
    });
    actionsRegistry.add('undelete', undeleteAction, {
        priority: 4.1,
        buttonIcon: <Delete/>,
        target: ["contentTreeMenuActions", "tableMenuActions", "additionalPreviewMenu", "contextualMenuFoldersAction", "contextualMenuFilesAction", "contextualMenuContentAction"],
        retrieveProperties: {retrievePropertiesNames: ["jcr:mixinTypes"]},
        requiredPermission: "jcr:removeNode",
        buttonLabel: "label.contentManager.contentPreview.undelete",
        hideOnNodeTypes: ["jnt:page"]
    });
    actionsRegistry.add('createMenu', menuAction, {
        menu: "createMenuActions",
        requiredPermission: "jcr:addChildNodes",
        buttonLabel: "label.contentManager.create.create",
        hideOnNodeTypes: ["jnt:page"]
    });
    actionsRegistry.add('lock', lockManagementAction, {
        priority: 5,
        action: 'lock',
        target: ["contentTreeMenuActions", "contextualMenuFoldersAction"],
        retrieveProperties: {retrievePropertiesNames: ["j:lockTypes"]},
        requiredPermission: "jcr:lockManagement",
        buttonLabel: 'label.contentManager.contextMenu.lockActions.lock',
        showOnNodeTypes: ["jnt:contentFolder"]
    });
    actionsRegistry.add('unlock', lockManagementAction, {
        priority: 5,
        action: 'unlock',
        target: ["contentTreeMenuActions", "contextualMenuFoldersAction"],
        requiredPermission: "jcr:lockManagement",
        retrieveProperties: {retrievePropertiesNames: ["j:lockTypes"]},
        buttonLabel: 'label.contentManager.contextMenu.lockActions.unlock',
        showOnNodeTypes: ["jnt:contentFolder"]
    });
    actionsRegistry.add('clearAllLocks', lockManagementAction, {
        priority: 5,
        action: 'clearAllLocks',
        target: ["contentTreeMenuActions", "contextualMenuFoldersAction"],
        requiredPermission: "jcr:lockManagement",
        retrieveProperties: {retrievePropertiesNames: ["j:lockTypes"]},
        buttonLabel: 'label.contentManager.contextMenu.lockActions.clearAllLocks',
        showOnNodeTypes: ["jnt:contentFolder"]
    });

    actionsRegistry.add('contentLeftMenu', routerAction, {
        mode: "browse",
        // menuId: "leftMenuContentActions",
        customIcon: {name: 'content', viewBox: '0 0 512 512'},
        // buttonIcon: <Error/>,
        target: ["leftMenuActions:1"],
        buttonLabel: 'label.contentManager.leftMenu.content',
    });
    actionsRegistry.add('mediaLeftMenu', routerAction, {
        customIcon: {name: 'media', viewBox: '0 0 512 512'},
        // buttonIcon: <Error/>,
        mode: "browse-files",
        // menuId : "leftMenuMediaActions",
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
        requiredPermission: "",
        target: ["leftMenuBottomAction:6"],
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
    actionsRegistry.add('roles', routerAction, {
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