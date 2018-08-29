import CallAction from "./CallAction"
import {Edit} from "@material-ui/icons";
import CreateContentAction from "./CreateContentAction";
import LockManagementAction from "./LockManagementAction";

let edit = (context) => window.parent.editContent(context.path, context.displayName, ["jnt:content"], ["nt:base"]);
let createContentFolder = (context) => window.parent.createContent(context.path, ["jnt:contentFolder"], false);
let createFolder = (context) => window.parent.createContent(context.path, ["jnt:folder"], false);
let createContent = (context) =>  window.parent.createContent(context.path, context.nodeTypes, context.includeSubTypes);

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
        component: CreateContentAction,
        call: createContentFolder,
        priority: 3,
        target: ["createMenuActions", "contentTreeMenuActions"],
        requiredAllowedChildNodeType: "jnt:contentFolder",
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
        requiredChildNodeSuperType: "jmix:editorialContent"
    },
    createFolder: {
        component: CreateContentAction,
        call: createFolder,
        priority: 3,
        target: ["createMenuActions", "contentTreeMenuActions"],
        requiredAllowedChildNodeType: "jnt:folder",
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
        component: "menuAction",
        menuId: "publishMenu",
        icon: "Edit",
        target: ["previewBar", "tableMenuActions"],
        requiredPermission: "",
        labelKey: "label.contentManager.contentPreview.publish"
    },
    publishAll: {
        component: "action",
        call: () => alert("not implemented yet"),
        icon: "Edit",
        target: ["publishMenu"],
        requiredPermission: "",
        labelKey: "label.contentManager.contentPreview.publishAll"
    },
    unPublish: {
        component: "action",
        call: () => alert("not implemented yet"),
        icon: "Edit",
        target: ["publishMenu"],
        requiredPermission: "",
        labelKey: "label.contentManager.contentPreview.unpublish"
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