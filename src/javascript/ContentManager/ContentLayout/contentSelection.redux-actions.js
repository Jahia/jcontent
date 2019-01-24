import {cmSetPreviewSelection} from '../preview.redux-actions';

const CM_ADD_SELECTION = 'CM_ADD_SELECTION';
const CM_REMOVE_SELECTION = 'CM_REMOVE_SELECTION';
const CM_SWITCH_SELECTION = 'CM_SWITCH_SELECTION';
const CM_CLEAR_SELECTION = 'CM_CLEAR_SELECTION';

function getAction(path, type) {
    return (dispatch, getState) => {
        dispatch({
            type: type,
            path: path
        });
        let s = getState();
        if (s.selection.length > 0 && s.previewSelection) {
            dispatch(cmSetPreviewSelection(null));
        }
    };
}

function cmAddSelection(path) {
    return getAction(path, CM_ADD_SELECTION);
}

function cmRemoveSelection(path) {
    return getAction(path, CM_REMOVE_SELECTION);
}

function cmSwitchSelection(path) {
    return getAction(path, CM_SWITCH_SELECTION);
}

function cmClearSelection() {
    return {
        type: CM_CLEAR_SELECTION
    };
}

export {CM_ADD_SELECTION, CM_REMOVE_SELECTION, CM_SWITCH_SELECTION, CM_CLEAR_SELECTION, cmAddSelection, cmRemoveSelection, cmSwitchSelection, cmClearSelection};
