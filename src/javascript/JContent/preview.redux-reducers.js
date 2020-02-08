import {cmSetPreviewMode, cmSetPreviewSelection, cmSetPreviewState} from './preview.redux-actions';
import {CM_DRAWER_STATES, CM_PREVIEW_MODES} from './JContent.redux-actions';
import {handleAction, handleActions} from 'redux-actions';

export const previewSelectionReducer = handleAction(cmSetPreviewSelection, (state, action) => action.payload, null);

export const previewModeReducer = handleActions({
    [cmSetPreviewMode]: (state, action) => action.payload,
    [cmSetPreviewState]: () => CM_PREVIEW_MODES.EDIT
}, CM_PREVIEW_MODES.EDIT);

export const previewStateReducer = handleAction(cmSetPreviewState, (state, action) => action.payload, CM_DRAWER_STATES.HIDE);
