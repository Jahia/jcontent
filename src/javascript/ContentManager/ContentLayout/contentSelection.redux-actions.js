const CM_ADD_SELECTION = 'CM_ADD_SELECTION';
const CM_REMOVE_SELECTION = 'CM_REMOVE_SELECTION';
const CM_SWITCH_SELECTION = 'CM_SWITCH_SELECTION';

function cmAddSelection(path) {
    return {
        type: CM_ADD_SELECTION,
        path: path
    };
}

function cmRemoveSelection(path) {
    return {
        type: CM_REMOVE_SELECTION,
        path: path
    };
}

function cmSwitchSelection(path) {
    return {
        type: CM_SWITCH_SELECTION,
        path: path
    };
}

export {CM_ADD_SELECTION, CM_REMOVE_SELECTION, CM_SWITCH_SELECTION, cmAddSelection, cmRemoveSelection, cmSwitchSelection};
