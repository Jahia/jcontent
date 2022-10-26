import {CM_DRAWER_STATES, CM_PREVIEW_MODES} from './JContent.redux';
import {createActions, handleAction, handleActions} from 'redux-actions';

export const {cmSetPreviewMode, cmSetPreviewState} = createActions('CM_SET_PREVIEW_MODE', 'CM_SET_PREVIEW_STATE');

export const cmSetPreviewSelection = previewSelection => (dispatch, getState) => {
    if (!previewSelection || getState().jcontent.selection.length === 0) {
        dispatch({
            type: 'CM_SET_PREVIEW_SELECTION',
            payload: previewSelection
        });
    }
};

cmSetPreviewSelection.toString = () => 'CM_SET_PREVIEW_SELECTION';

export const previewRedux = registry => {
    const previewSelectionReducer = handleAction(cmSetPreviewSelection, (state, action) => action.payload, null);

    const previewModeReducer = handleActions({
        [cmSetPreviewMode]: (state, action) => action.payload,
        [cmSetPreviewState]: () => CM_PREVIEW_MODES.EDIT
    }, CM_PREVIEW_MODES.EDIT);

    const previewStateReducer = handleAction(cmSetPreviewState, (state, action) => action.payload, CM_DRAWER_STATES.HIDE);

    registry.add('redux-reducer', 'previewMode', {targets: ['jcontent'], reducer: previewModeReducer});
    registry.add('redux-reducer', 'previewState', {targets: ['jcontent'], reducer: previewStateReducer});
    registry.add('redux-reducer', 'previewSelection', {targets: ['jcontent'], reducer: previewSelectionReducer});
};
