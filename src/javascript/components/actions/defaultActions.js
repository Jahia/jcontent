import CallAction from "./CallAction"
import {Edit, Publish} from "@material-ui/icons";
import CreateContentAction from "./CreateContentAction";
import CreateContentOfTypeAction from "./CreateContentOfTypeAction";
import DeleteAction from "./DeleteAction";
import DeletePermanentlyAction from "./DeletePermanentlyAction";
import PublishAction from "./PublishAction";
import PublishDeletionAction from "./PublishDeletionAction";
import LockManagementAction from "./LockManagementAction";
import Constants from "../constants";
import FileUploadAction from './FileUploadAction';
import UndeleteAction from "./UndeleteAction";
import CopyAction from '../copyPaste/CopyAction';
import PasteAction from '../copyPaste/PasteAction';

let edit = (context) => window.parent.authoringApi.editContent(context.path, context.displayName, ["jnt:content"], [context.primaryNodeType], context.uuid, false);
let createContentFolder = (context) => window.parent.authoringApi.createContent(context.path, ["jnt:contentFolder"], false);
let createFolder = (context) => window.parent.authoringApi.createContent(context.path, ["jnt:folder"], false);
let createContent = (context) =>  window.parent.authoringApi.createContent(context.path, context.nodeTypes, context.includeSubTypes);
let publish = (context) => window.parent.authoringApi.openPublicationWorkflow(context.uuid, context.allSubTree, context.allLanguages, context.checkForUnpublication);

let defaultActions = {
    edit: {
        component: CallAction,
        call: edit,
        icon: Edit,
        priority: 2.5,
        target: ["editPreviewBar", "contentTreeMenuActions", "tableEditButtonAction", "contextualMenuPagesAction", "contextualMenuFoldersAction", "contextualMenuFilesAction", "contextualMenuContentAction"],
        requiredPermission: "",
        labelKey: "label.contentManager.contentPreview.edit"
    },
    createContentFolder: {
        component: CreateContentOfTypeAction,
        call: createContentFolder,
        priority: 3,
        target: ["createMenuActions", "contentTreeMenuActions", "contextualMenuFoldersAction"],
        contentType: "jnt:contentFolder",
        requiredPermission: "jcr:addChildNodes",
        labelKey: "label.contentManager.create.contentFolder",
        hideOnNodeTypes: ["jnt:page"]
    },
    createContent: {
        component: CreateContentAction,
        call: createContent,
        priority: 3.1,
        target: ["createMenuActions", "contentTreeMenuActions", "contextualMenuFoldersAction"],
        requiredPermission: "jcr:addChildNodes",
        labelKey: "label.contentManager.create.content",
        hideOnNodeTypes: ["jnt:page", "jnt:folder"],
        baseContentType: Constants.contentType
    },
    createFolder: {
        component: CreateContentOfTypeAction,
        call: createFolder,
        priority: 3,
        target: ["createMenuActions", "contentTreeMenuActions", "contextualMenuFilesAction"],
        contentType: "jnt:folder",
        requiredPermission: "jcr:addChildNodes",
        labelKey: "label.contentManager.create.folder",
        hideOnNodeTypes: ["jnt:page"]
    },
    fileUpload: {
        component: FileUploadAction,
        priority: 4,
        target: ["createMenuActions", "contentTreeMenuActions", "contextualMenuFilesAction"],
        requiredPermission: "jcr:addChildNodes",
        labelKey: "label.contentManager.fileUpload.uploadButtonLabel",
        hideOnNodeTypes: ["jnt:page", "jnt:contentFolder"]
    },
    translate: {
        priority: 2.51,
        component: "callAction",
        call: () => alert("Translate !!!"),
        icon: "Edit",
        target: [],
        requiredPermission: "",
        labelKey: "label.contentManager.contentPreview.translate"
    },
    tableActions: {
        priority: 2.5,
        component: "menuAction",
        menuId: "tableMenuActions",
        target: ["tableActions"],
        requiredPermission: "",
        labelKey: "label.contentManager.contentPreview.edit"
    },
    contentTreeActions: {
        priority: 2.5,
        component: "menuAction",
        menuId: "contentTreeMenuActions",
        target: ["contentTreeActions"],
        requiredPermission: "",
        labelKey: "label.contentManager.contentPreview.edit"
    },
    publish: {
        priority: 1,
        component: PublishAction,
        call: publish,
        icon: "Publish",
        target: ["publishMenu", "publishTableMenu"],
        requiredPermission: "",
        labelKey: "label.contentManager.contentPreview.publish",
        allSubtree: false,
        allLanguages: false,
        checkForUnpublication: false,
        checkIfLanguagesMoreThanOne: false,
        hideOnNodeTypes: ["jnt:virtualsite"],
        retrieveProperties: {retrievePropertiesNames: ["jcr:mixinTypes"]}
    },
    publishInContentTreeMenu: {
        priority: 5,
        component: PublishAction,
        call: publish,
        icon: "Publish",
        target: ["contentTreeMenuActions", "contextualMenuPagesAction", "contextualMenuFoldersAction", "contextualMenuFilesAction", "contextualMenuContentAction"],
        requiredPermission: "",
        labelKey: "label.contentManager.contentPreview.publish",
        allSubtree: false,
        allLanguages: false,
        checkForUnpublication: false,
        checkIfLanguagesMoreThanOne: false,
        hideOnNodeTypes: ["jnt:virtualsite"],
        retrieveProperties: {retrievePropertiesNames: ["jcr:mixinTypes"]}
    },
    advancedPublish: {
        priority: 6,
        component: "menuAction",
        menuId: "advancedPublish",
        icon: "Publish",
        target: ["contentTreeMenuActions", "contextualMenuPagesAction", "contextualMenuFoldersAction", "contextualMenuFilesAction"],
        requiredPermission: "",
        labelKey: "label.contentManager.contentPreview.advancedPublish"
    },
    publishMenu: {
        component: "menuAction",
        menuId: "publishMenu",
        target: ["editPreviewBar", "thumbnailPublishMenu"],
        labelKey: "label.contentManager.contentPreview.publishMenu"
    },
    publishTableMenu: {
        component: "menuAction",
        menuId: "publishTableMenu",
        target: ["tableMenuActions"],
        labelKey: "label.contentManager.contentPreview.publishTableMenu"
    },
    publishInAllLanguages: {
        component: PublishAction,
        call: publish,
        icon: "Publish",
        target: ["publishMenu", "advancedPublish", "publishTableMenu", "contextualMenuContentAction"],
        requiredPermission: "",
        allSubTree: false,
        allLanguages: true,
        checkForUnpublication: false,
        hideOnNodeTypes: ["nt:file", "nt:folder"],
        checkIfLanguagesMoreThanOne: true,
        labelKey: "label.contentManager.contentPreview.publishInAllLanguages",
        retrieveProperties: {retrievePropertiesNames: ["jcr:mixinTypes"]}
    },
    publishAll: {
        component: PublishAction,
        call: publish,
        icon: "Publish",
        target: ["publishMenu", "advancedPublish"],
        requiredPermission: "",
        allSubTree: true,
        allLanguages: false,
        checkForUnpublication: false,
        checkIfLanguagesMoreThanOne: false,
        hideOnNodeTypes: ["nt:file"],
        labelKey: "label.contentManager.contentPreview.publishAll",
        retrieveProperties: {retrievePropertiesNames: ["jcr:mixinTypes"]}
    },
    publishAllInAllLanguages: {
        component: PublishAction,
        call: publish,
        icon: "Publish",
        target: ["publishMenu", "advancedPublish"],
        requiredPermission: "",
        allSubTree: true,
        allLanguages: true,
        checkForUnpublication: false,
        hideOnNodeTypes: ["nt:file", "nt:folder"],
        checkIfLanguagesMoreThanOne: true,
        labelKey: "label.contentManager.contentPreview.publishAllInAllLanguages",
        retrieveProperties: {retrievePropertiesNames: ["jcr:mixinTypes"]}
    },
    publishDeletion: {
        priority: 6,
        component: PublishDeletionAction,
        icon: "Publish",
        target: ["editPreviewBar", "contentTreeMenuActions", "tableMenuActions", "contextualMenuFoldersAction", "contextualMenuFilesAction", "contextualMenuContentAction"],
        requiredPermission: "",
        labelKey: "label.contentManager.contentPreview.publishDeletion",
        hideOnNodeTypes: ["jnt:virtualsite"],
        retrieveProperties: {retrievePropertiesNames: ["jcr:mixinTypes"]}
    },
    unPublish: {
        component: PublishAction,
        call: publish,
        icon: "Publish",
        target: ["livePreviewBar", "publishMenu", "advancedPublish", "publishTableMenu", "contextualMenuContentAction"],
        requiredPermission: "",
        allSubTree: false,
        allLanguages: false,
        checkForUnpublication: true,
        checkIfLanguagesMoreThanOne: false,
        hideOnNodeTypes: ["jnt:virtualsite"],
        labelKey: "label.contentManager.contentPreview.unpublish"
    },
    additionalPreview: {
        component: "menuAction",
        menuId: "additionalPreviewMenu",
        icon: "Edit",
        target: ["editAdditionalMenu"],
        requiredPermission: "",
        iconButton: true
    },
    duplicate: {
        component: CallAction,
        call: () => alert("not implemented yet"),
        icon: "Edit",
        target: ["additionalPreviewMenu"],
        requiredPermission: "",
        labelKey: "label.contentManager.contentPreview.duplicate"
    },
    copy: {
        priority: 3.8,
        component: CopyAction,
        icon: "Copy",
        target: ["additionalPreviewMenu", "tableMenuActions", "contextualMenuFoldersAction", "contextualMenuFilesAction", "contextualMenuContentAction"],
        requiredPermission: "jcr:addChildNodes",
        labelKey: "label.contentManager.contentPreview.copy",
        hideOnNodeTypes: ["jnt:page"]
    },
    pasteFile: {
        priority: 3.8,
        component: PasteAction,
        icon: "Paste",
        target: ["contextualMenuFilesAction"],
        requiredPermission: "jcr:addChildNodes",
        labelKey: "label.contentManager.contentPreview.paste",
        hideOnNodeTypes: ["jnt:page", "jnt:contentFolder"],
        baseContentType: "jnt:file"
    },
    pasteFolder: {
        priority: 3.9,
        component: PasteAction,
        icon: "Paste",
        target: ["contextualMenuFilesAction"],
        requiredPermission: "jcr:addChildNodes",
        labelKey: "label.contentManager.contentPreview.paste",
        hideOnNodeTypes: ["jnt:page", "jnt:contentFolder"],
        baseContentType: "jnt:folder"
    },
    pasteContentFolderContent: {
        priority: 3.8,
        component: PasteAction,
        icon: "Paste",
        target: ["contextualMenuFoldersAction"],
        requiredPermission: "jcr:addChildNodes",
        labelKey: "label.contentManager.contentPreview.paste",
        hideOnNodeTypes: ["jnt:page", "jnt:folder"],
        baseContentType: "jmix:editorialContent"
    },
    // pasteContentFolder: {
    //     priority: 3.9,
    //     component: PasteAction,
    //     icon: "Paste",
    //     target: ["contextualMenuFoldersAction"],
    //     requiredPermission: "jcr:addChildNodes",
    //     labelKey: "label.contentManager.contentPreview.paste",
    //     hideOnNodeTypes: ["jnt:page", "jnt:folder"],
    //     baseContentType: "jnt:contentFolder"
    // },
    pastePageContent: {
        priority: 3.8,
        component: PasteAction,
        icon: "Paste",
        target: ["contextualMenuPagesAction"],
        requiredPermission: "jcr:addChildNodes",
        labelKey: "label.contentManager.contentPreview.paste",
        hideOnNodeTypes: ["jnt:contentFolder", "jnt:folder"],
        baseContentType: "jmix:editorialContent"
    },
    cut: {
        priority: 3.9,
        component: CallAction,
        call: () => alert("not implemented yet"),
        icon: "Cut",
        target: ["tableMenuActions"],
        requiredPermission: "jcr:removeNode",
        labelKey: "label.contentManager.contentPreview.cut",
        hideOnNodeTypes: ["jnt:page"]
    },
    delete: {
        priority: 4,
        component: DeleteAction,
        icon: "Delete",
        target: ["contentTreeMenuActions", "tableMenuActions", "additionalPreviewMenu", "contextualMenuFoldersAction", "contextualMenuFilesAction", "contextualMenuContentAction"],
        retrieveProperties: {retrievePropertiesNames: ["jcr:mixinTypes"]},
        requiredPermission: "jcr:removeNode",
        labelKey: "label.contentManager.contentPreview.delete",
        hideOnNodeTypes: ["jnt:page"]
    },
    deletePermanetly: {
        priority: 4,
        component: DeletePermanentlyAction,
        icon: "Delete",
        target: ["contentTreeMenuActions", "tableMenuActions", "additionalPreviewMenu", "contextualMenuFoldersAction", "contextualMenuFilesAction", "contextualMenuContentAction"],
        retrieveProperties: {retrievePropertiesNames: ["jcr:mixinTypes"]},
        requiredPermission: "jcr:removeNode",
        labelKey: "label.contentManager.contentPreview.deletePermanently",
        hideOnNodeTypes: ["jnt:page"]
    },
    undelete: {
        priority: 4.1,
        component: UndeleteAction,
        icon: "Delete",
        target: ["contentTreeMenuActions", "tableMenuActions", "additionalPreviewMenu", "contextualMenuFoldersAction", "contextualMenuFilesAction", "contextualMenuContentAction"],
        retrieveProperties: {retrievePropertiesNames: ["jcr:mixinTypes"]},
        requiredPermission: "jcr:removeNode",
        labelKey: "label.contentManager.contentPreview.undelete",
        hideOnNodeTypes: ["jnt:page"]
    },
    createMenu: {
        component: "menuAction",
        menuId: "createMenuActions",
        target: ["createMenu"],
        requiredPermission: "jcr:addChildNodes",
        labelKey: "label.contentManager.create.create",
        hideOnNodeTypes: ["jnt:page"]
    },
    lock: {
        priority: 5,
        action:'lock',
        component: LockManagementAction,
        target: ["contentTreeMenuActions", "contextualMenuFoldersAction"],
        retrieveProperties: {retrievePropertiesNames: ["j:lockTypes"]},
        requiredPermission: "jcr:lockManagement",
        labelKey: 'label.contentManager.contextMenu.lockActions.lock',
        showOnNodeTypes: ["jnt:contentFolder"]
    },
    unlock: {
        priority: 5,
        action: 'unlock',
        component: LockManagementAction,
        target: ["contentTreeMenuActions", "contextualMenuFoldersAction"],
        requiredPermission: "jcr:lockManagement",
        retrieveProperties: {retrievePropertiesNames: ["j:lockTypes"]},
        labelKey: 'label.contentManager.contextMenu.lockActions.unlock',
        showOnNodeTypes: ["jnt:contentFolder"]
    },
    clearAllLocks: {
        priority: 5,
        action: 'clearAllLocks',
        component: LockManagementAction,
        target: ["contentTreeMenuActions", "contextualMenuFoldersAction"],
        requiredPermission: "jcr:lockManagement",
        retrieveProperties: {retrievePropertiesNames: ["j:lockTypes"]},
        labelKey: 'label.contentManager.contextMenu.lockActions.clearAllLocks',
        showOnNodeTypes: ["jnt:contentFolder"]
    },
};

export default defaultActions;