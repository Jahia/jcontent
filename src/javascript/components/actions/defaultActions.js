import CallAction from './CallAction'
import {Edit} from "@material-ui/icons";

let edit = (context) => window.parent.editContent(context.path, context.displayName, ['jnt:content'], ['nt:base']);
// updateButtonItemCallback is called by GWT when the save succeed on UpdateButton component in GWT engine
let defaultActions = {
    edit: {
        component: CallAction,
        call: edit ,
        icon: Edit,
    }
}

export default defaultActions;