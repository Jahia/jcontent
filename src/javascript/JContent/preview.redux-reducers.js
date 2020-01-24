import {CM_SET_PREVIEW, CM_SET_PREVIEW_MODE, CM_SET_PREVIEW_SELECTION} from './preview.redux-actions';
import {CM_DRAWER_STATES, CM_PREVIEW_MODES, CM_SET_TREE} from './JContent.redux-actions';

let previewSelectionReducer = (state = null, action = {}) => {
    if (action.type === CM_SET_PREVIEW_SELECTION) {
        return action.previewSelection;
    }

    return state;
};

let previewModeReducer = (state = CM_PREVIEW_MODES.EDIT, action = {}) => {
    switch (action.type) {
        case CM_SET_PREVIEW_MODE:
            return action.previewMode;
        case CM_SET_PREVIEW:
            return CM_PREVIEW_MODES.EDIT;
        default:
            return state;
    }
};

let previewStateReducer = (state = CM_DRAWER_STATES.HIDE, action = {}) => {
    switch (action.type) {
        case CM_SET_PREVIEW:
            return action.previewState;
        case CM_SET_TREE: {
            if (action.treeState === CM_DRAWER_STATES.SHOW && state === CM_DRAWER_STATES.SHOW) {
                return CM_DRAWER_STATES.TEMP;
            }

            if (action.treeState === CM_DRAWER_STATES.HIDE && state === CM_DRAWER_STATES.TEMP) {
                return CM_DRAWER_STATES.SHOW;
            }

            return state;
        }

        default:
            return state;
    }
};

export {previewStateReducer, previewModeReducer, previewSelectionReducer};
