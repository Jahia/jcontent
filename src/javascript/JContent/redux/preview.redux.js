import {CM_DRAWER_STATES} from './JContent.redux';
import {createActions, handleAction} from 'redux-actions';

export const {cmSetPreviewState} = createActions('CM_SET_PREVIEW_STATE');

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

    const previewStateReducer = handleAction(cmSetPreviewState, (state, action) => action.payload, CM_DRAWER_STATES.HIDE);

    registry.add('redux-reducer', 'previewState', {targets: ['jcontent'], reducer: previewStateReducer});
    registry.add('redux-reducer', 'previewSelection', {targets: ['jcontent'], reducer: previewSelectionReducer});
};
