import Action from './Action'
import {Edit} from "@material-ui/icons";

let edit = (path) => window.parent.editContent(path, ['jnt:content'], ['nt:base']);
// updateButtonItemCallback is called by GWT when the save succeed on UpdateButton component in GWT engine
let editCallback = {updateButtonItemCallback: (path) => window.parent.resetContentManagerStore(path)};
let defaultActions = {
    edit: {
        component: Action,
        call: edit ,
        icon: Edit,
        callback: editCallback
    }

}

export default defaultActions;