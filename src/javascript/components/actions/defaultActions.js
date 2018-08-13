import CallAction from './CallAction'
import {Edit} from "@material-ui/icons";
import * as _ from "lodash";

let edit = (context) => window.parent.editContent(context.path, context.displayName, ['jnt:content'], ['nt:base']);

let createContentFolder = (context) => window.parent.createContent(context.path, 'jnt:contentFolder', false);
let createContent = (context) => {
    return window.parent.createContent(context.path, _.join(context.nodeTypes, " "), true);
}

// updateButtonItemCallback is called by GWT when the save succeed on UpdateButton component in GWT engine
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
        component: CallAction,
        provideAllowedChildNodeTypes: true,
        call: createContent,
    }
}

export default defaultActions;