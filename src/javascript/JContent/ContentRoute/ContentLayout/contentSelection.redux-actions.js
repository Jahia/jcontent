import {cmSetPreviewSelection} from '../../preview.redux-actions';
import {createAction} from 'redux-actions';

const getAction = (path, type) => (dispatch, getState) => {
    dispatch({
        type: type,
        payload: path
    });
    let s = getState();
    if (s.selection.length > 0 && s.previewSelection) {
        dispatch(cmSetPreviewSelection(null));
    }
};

export const cmAddSelection = path => getAction(path, 'CM_ADD_SELECTION');
cmAddSelection.toString = () => 'CM_ADD_SELECTION';

export const cmRemoveSelection = path => getAction(path, 'CM_REMOVE_SELECTION');
cmRemoveSelection.toString = () => 'CM_REMOVE_SELECTION';

export const cmSwitchSelection = path => getAction(path, 'CM_SWITCH_SELECTION');
cmSwitchSelection.toString = () => 'CM_SWITCH_SELECTION';

export const cmClearSelection = createAction('CM_CLEAR_SELECTION');
