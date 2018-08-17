import CallAction from './CallAction'
import {Edit} from "@material-ui/icons";
import CreateContentAction from "./CreateContentAction";

let edit = (context) => window.parent.editContent(context.path, context.displayName, ['jnt:content'], ['nt:base']);
let createContentFolder = (context) => window.parent.createContent(context.path, 'jnt:contentFolder', false);
let createContent = (context) => {
    return window.parent.createContent(context.path, context.nodeTypes, true);
}

let defaultActions = {
    edit: {
        component: CallAction,
        call: edit,
        icon: Edit,
    },
    createContentFolder: {
        component: CallAction,
        call: createContentFolder,

    },
    createContent: {
        component: CreateContentAction,
        provideAllowedChildNodeTypes: true,
        call: createContent,
    }
}

export default defaultActions;