import {createActions, handleAction} from 'redux-actions';

export const {cmSetPreviewFullScreen} = createActions('CM_SET_PREVIEW_FULL_SCREEN');

export const cmSetSidePanelSelection = sidePanelSelection => (dispatch, getState) => {
    if (!sidePanelSelection || getState().jcontent.selection.length === 0) {
        dispatch({
            type: 'CM_SET_SIDE_PANEL_SELECTION',
            payload: sidePanelSelection
        });
    }
};

cmSetSidePanelSelection.toString = () => 'CM_SET_SIDE_PANEL_SELECTION';

export const cmCloseSidePanel = () => (dispatch, getState) => {
    dispatch(cmSetSidePanelSelection(null));
    if (getState().jcontent.previewIsFullScreen) {
        dispatch(cmSetPreviewFullScreen(false));
    }
};

export const previewRedux = registry => {
    const sidePanelSelectionReducer = handleAction(cmSetSidePanelSelection, (state, action) => action.payload, null);
    const previewIsFullScreenReducer = handleAction(cmSetPreviewFullScreen, (state, action) => action.payload, false);

    registry.add('redux-reducer', 'previewIsFullScreen', {targets: ['jcontent'], reducer: previewIsFullScreenReducer});
    registry.add('redux-reducer', 'sidePanelSelection', {targets: ['jcontent'], reducer: sidePanelSelectionReducer});
};
