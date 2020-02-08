import {createActions} from 'redux-actions';

export const cmSetPreviewSelection = previewSelection => (dispatch, getState) => {
    if (!previewSelection || getState().selection.length === 0) {
        dispatch({
            type: 'CM_SET_PREVIEW_SELECTION',
            payload: previewSelection
        });
    }
};

cmSetPreviewSelection.toString = () => 'CM_SET_PREVIEW_SELECTION';

export const {cmSetPreviewMode, cmSetPreviewState} = createActions('CM_SET_PREVIEW_MODE', 'CM_SET_PREVIEW_STATE')

