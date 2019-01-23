const CM_SET_PREVIEW_SELECTION = 'CM_SET_PREVIEW_SELECTION';
const CM_SET_PREVIEW_MODE = 'CM_SET_PREVIEW_MODE';
const CM_SET_PREVIEW = 'CM_SET_PREVIEW';

function cmSetPreviewSelection(previewSelection) {
    return {
        type: CM_SET_PREVIEW_SELECTION,
        previewSelection
    };
}

function cmSetPreviewMode(mode) {
    return {
        type: CM_SET_PREVIEW_MODE,
        previewMode: mode
    };
}

function cmSetPreviewState(state) {
    return {
        type: CM_SET_PREVIEW,
        previewState: state
    };
}

export {CM_SET_PREVIEW, CM_SET_PREVIEW_MODE, CM_SET_PREVIEW_SELECTION, cmSetPreviewState, cmSetPreviewMode, cmSetPreviewSelection};
