import { uploadStatuses } from '../constatnts';

const initialState = {
    path: null,  //folder that will get files
    panelState: "INVISIBLE", //or "VISIBLE", "PARTIALLY_VISIBLE"
    status: "NOT_STARTED", //or "UPLOADING", "UPLOADED", "HAS_ERROR"
    uploads: []
};

const upload = {
    id: "",
    status: "QUEUED", //or "UPLOADING", "UPLOADED", "HAS_ERROR"
    error: null
};

export const fileUpload = (state = initialState, action) => {
    switch(action.type) {
        case "FILEUPLOAD_SET_PATH" : return {
            ...state,
            path: action.path
        };
        case "FILEUPLOAD_SET_PANEL_STATE" : return {
            ...state,
            panelState: action.state
        };
        case "FILEUPLOAD_SET_STATUS" : return {
            ...state,
            status: action.status
        };
        case "FILEUPLOAD_SET_UPLOADS" : return {
            ...state,
            uploads: action.uploads
        };
        case "FILEUPLOAD_UPDATE_UPLOAD" : return state.uploads.map((upload) => {
            if (upload.id === action.upload.id) {
                return action.upload
            }
            return upload;
        });
        case "FILEUPLOAD_TAKE_FROM_QUEUE" :
            let numTaken = 0;
            return state.uploads.map((upload) => {
                if (upload.status === uploadStatuses.QUEUED && numTaken < action.number) {
                    numTaken++;
                    return {
                        ...upload,
                        state: uploadStatuses.UPLOADING
                    }
                }
                return upload;
            });

        default : return state;
    }
};

