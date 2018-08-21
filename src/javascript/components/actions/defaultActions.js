import CallAction from "./CallAction"
import {Edit} from "@material-ui/icons";
import CreateContentAction from "./CreateContentAction";

let edit = (context) => window.parent.editContent(context.path, context.displayName, ["jnt:content"], ["nt:base"]);
let createContentFolder = (context) => window.parent.createContent(context.path, ["jnt:contentFolder"], false);
let createFolder = (context) => window.parent.createContent(context.path, ["jnt:folder"], false);
let createContent = (context) =>  window.parent.createContent(context.path, context.nodeTypes, true);

let defaultActions = {
    edit: {
        component: CallAction,
        call: edit,
        icon: Edit,
    },
    createContentFolder: {
        component: CreateContentAction,
        call: createContentFolder,

    },
    createContent: {
        component: CreateContentAction,
        provideAllowedChildNodeTypes: true,
        call: createContent,
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
    }
}

export default defaultActions;