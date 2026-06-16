import {createActions, handleAction} from 'redux-actions';

export const {cmSetPreviewFullScreen} = createActions('CM_SET_PREVIEW_FULL_SCREEN');

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

    const previewIsFullScreenReducer = handleAction(cmSetPreviewFullScreen, (state, action) => action.payload, false);

    registry.add('redux-reducer', 'previewIsFullScreen', {targets: ['jcontent'], reducer: previewIsFullScreenReducer});
    registry.add('redux-reducer', 'previewSelection', {targets: ['jcontent'], reducer: previewSelectionReducer});
};
