import CallAction from "./CallAction"
import {Edit, Publish} from "@material-ui/icons";
import CreateContentAction from "./CreateContentAction";
import CreateContentOfTypeAction from "./CreateContentOfTypeAction";
import PublishAction from "./PublishAction";
import LockManagementAction from "./LockManagementAction";

let edit = (context) => window.parent.editContent(context.path, context.displayName, ["jnt:content"], ["nt:base"]);
let createContentFolder = (context) => window.parent.createContent(context.path, ["jnt:contentFolder"], false);
let createFolder = (context) => window.parent.createContent(context.path, ["jnt:folder"], false);
let createContent = (context) =>  window.parent.createContent(context.path, context.nodeTypes, context.includeSubTypes);
let publish = (context) => window.parent.openPublicationWorkflow(context.uuid, context.allSubTree, context.allLanguages, context.checkForUnpublication);

let defaultActions = {
    edit: {
        component: CallAction,
        call: edit,
        icon: Edit,
        priority: 2.5,
        target: ["previewBar", "tableMenuActions", "contentTreeMenuActions"],
        requiredPermission: "",
        labelKey: "label.contentManager.contentPreview.edit"
    },
    createContentFolder: {
        component: CreateContentOfTypeAction,
        call: createContentFolder,
        priority: 3,
        target: ["createMenuActions", "contentTreeMenuActions"],
        contentType: "jnt:contentFolder",
        requiredPermission: "jcr:addChildNodes",
        labelKey: "label.contentManager.create.contentFolder",
        hideOnNodeTypes: ["jnt:page"]
    },
    createContent: {
        component: CreateContentAction,
        call: createContent,
        priority: 3.1,
        target: ["createMenuActions", "contentTreeMenuActions"],
        requiredPermission: "jcr:addChildNodes",
        labelKey: "label.contentManager.create.content",
        hideOnNodeTypes: ["jnt:page", "jnt:folder"],
        baseContentType: "jmix:editorialContent"
    },
    createFolder: {
        component: CreateContentOfTypeAction,
        call: createFolder,
        priority: 3,
        target: ["createMenuActions", "contentTreeMenuActions"],
        contentType: "jnt:folder",
        requiredPermission: "jcr:addChildNodes",
        labelKey: "label.contentManager.create.folder",
        hideOnNodeTypes: ["jnt:page"]
    },
    translate: {
        priority: 2.51,
        component: "action",
        call: () => alert("Translate !!!"),
        icon: "Edit",
        target: ["previewBar"],
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
        component: PublishAction,
        call: publish,
        icon: "Publish",
        target: ["previewBar", "tableMenuActions"],
        requiredPermission: "",
        labelKey: "label.contentManager.contentPreview.publish",
        allSubtree: false,
        allLanguages: false,
        checkForUnpublication: false,
        hideOnNodeTypes: ["jnt:virtualsite"]

    },
    advancedPublish: {
        component: "menuAction",
        menuId: "publishMenu",
        icon: "Publish",
        target: ["previewBar", "tableMenuActions"],
        requiredPermission: "",
        labelKey: "label.contentManager.contentPreview.advancedPublish"
    },
    publishInAllLanguages: {
        component: PublishAction,
        call: publish,
        icon: "Publish",
        target: ["publishMenu"],
        requiredPermission: "",
        allSubTree: false,
        allLanguages: true,
        checkForUnpublication: false,
        hideOnNodeTypes: ["nt:file", "nt:folder"],
        labelKey: "label.contentManager.contentPreview.publishInAllLanguages"
    },
    publishAll: {
        component: PublishAction,
        call: publish,
        icon: "Publish",
        target: ["publishMenu"],
        requiredPermission: "",
        allSubTree: true,
        allLanguages: false,
        checkForUnpublication: false,
        hideOnNodeTypes: ["nt:file"],
        labelKey: "label.contentManager.contentPreview.publishAll"
    },
    publishAllInAllLanguages: {
        component: PublishAction,
        call: publish,
        icon: "Publish",
        target: ["publishMenu"],
        requiredPermission: "",
        allSubTree: true,
        allLanguages: true,
        checkForUnpublication: false,
        hideOnNodeTypes: ["nt:file", "nt:folder"],
        labelKey: "label.contentManager.contentPreview.publishAllInAllLanguages"
    },
    unPublish: {
        component: PublishAction,
        call: publish,
        icon: "Publish",
        target: ["publishMenu"],
        requiredPermission: "",
        allSubTree: false,
        allLanguages: false,
        checkForUnpublication: true,
        hideOnNodeTypes: ["jnt:virtualsite"],
        labelKey: "label.contentManager.contentPreview.unpublish"
    },
    unPublishInAllLanguages: {
        component: PublishAction,
        call: publish,
        icon: "Publish",
        target: ["publishMenu"],
        requiredPermission: "",
        allSubTree: false,
        allLanguages: true,
        checkForUnpublication: true,
        hideOnNodeTypes: ["jnt:virtualsite"],
        labelKey: "label.contentManager.contentPreview.unpublishInAllLanguages"
    },
    additionalPreview: {
        component: "menuAction",
        menuId: "additionalPreviewMenu",
        icon: "Edit",
        target: ["additionalMenu"],
        requiredPermission: "",
        iconButton: true
    },
    duplicate: {
        component: "action",
        call: () => alert("not implemented yet"),
        icon: "Edit",
        target: ["additionalPreviewMenu"],
        requiredPermission: "",
        labelKey: "label.contentManager.contentPreview.duplicate"
    },
    copy: {
        component: "action",
        call: () => alert("not implemented yet"),
        icon: "Edit",
        target: ["additionalPreviewMenu"],
        requiredPermission: "",
        labelKey: "label.contentManager.contentPreview.copy"
    },
    delete: {
        component: "action",
        call: () => alert("not implemented yet"),
        icon: "Edit",
        target: ["additionalPreviewMenu"],
        requiredPermission: "",
        labelKey: "label.contentManager.contentPreview.delete"
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
        priority: 2.5,
        action:'lock',
        component: LockManagementAction,
        target: ["contentTreeMenuActions"],
        retrieveProperties: {retrievePropertiesNames: ["j:lockTypes"]},
        requiredPermission: "jcr:lockManagement",
        labelKey: 'label.contentManager.contextMenu.lockActions.lock',
        showOnNodeTypes: ["jnt:contentFolder"]
    },
    unlock: {
        priority: 2.5,
        action: 'unlock',
        component: LockManagementAction,
        target: ["contentTreeMenuActions"],
        requiredPermission: "jcr:lockManagement",
        retrieveProperties: {retrievePropertiesNames: ["j:lockTypes"]},
        labelKey: 'label.contentManager.contextMenu.lockActions.unlock',
        showOnNodeTypes: ["jnt:contentFolder"]
    },
    clearAllLocks: {
        priority: 2.5,
        action: 'clearAllLocks',
        component: LockManagementAction,
        target: ["contentTreeMenuActions"],
        requiredPermission: "jcr:lockManagement",
        retrieveProperties: {retrievePropertiesNames: ["j:lockTypes"]},
        labelKey: 'label.contentManager.contextMenu.lockActions.clearAllLocks',
        showOnNodeTypes: ["jnt:contentFolder"]
    },
};

export default defaultActions;