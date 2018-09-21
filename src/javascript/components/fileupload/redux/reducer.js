import { uploadStatuses, panelStates, uploadsStatuses } from '../constatnts';

const initialState = {
    path: null,  //folder that will get files
    panelState: panelStates.INVISIBLE,
    status: uploadsStatuses.NOT_STARTED,
    uploads: []
};

export const uploadSeed = {
    id: "",
    status: uploadStatuses.QUEUED,
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
        case "FILEUPLOAD_UPDATE_UPLOAD" : return {
            ...state,
            uploads: state.uploads.map((upload) => {
                if (upload.id === action.upload.id) {
                    return action.upload
                }
                return upload;
            })
        };
        case "FILEUPLOAD_REMOVE_UPLOAD" : return {
            ...state,
            uploads: state.uploads.filter((upload, index) => {
                return index !== action.index;
            })
        };
        case "FILEUPLOAD_TAKE_FROM_QUEUE" :
            let numTaken = 0;
            return {
                ...state,
                uploads: state.uploads.map((upload) => {
                    if (upload.status === uploadStatuses.QUEUED && numTaken < action.number) {
                        numTaken++;
                        return {
                            ...upload,
                            status: uploadStatuses.UPLOADING
                        }
                    }
                    return upload;
                })
            };

        default : return state;
    }
};

