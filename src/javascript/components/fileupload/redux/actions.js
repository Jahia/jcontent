export const setPath = path => {
    return {
        type: 'FILEUPLOAD_SET_PATH',
        path: path
    };
};

export const setPanelState = state => {
    return {
        type: 'FILEUPLOAD_SET_PANEL_STATE',
        state: state
    };
};

export const setStatus = status => {
    return {
        type: 'FILEUPLOAD_SET_STATUS',
        status: status
    };
};

export const setUploads = uploads => {
    return {
        type: 'FILEUPLOAD_SET_UPLOADS',
        uploads: uploads
    };
};

export const addUploads = uploads => {
    return {
        type: "FILEUPLOAD_ADD_UPLOADS",
        uploads: uploads
    }
};

export const updateUpload = upload => {
    return {
        type: 'FILEUPLOAD_UPDATE_UPLOAD',
        upload: upload
    };
};

export const removeUpload = index => {
    return {
        type: 'FILEUPLOAD_REMOVE_UPLOAD',
        index: index
    };
};

export const takeFromQueue = number => {
    return {
        type: 'FILEUPLOAD_TAKE_FROM_QUEUE',
        number: number
    };
};

export const setOverlayTarget = overlayTarget => {
    return {
        type: "FILEUPLOAD_SET_OVERLAY_TARGET",
        overlayTarget: overlayTarget
    }
};