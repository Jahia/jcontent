import {uploadStatuses, uploadsStatuses} from './Upload.constants';

const initialState = {
    path: null, // Folder that will get files
    status: uploadsStatuses.NOT_STARTED,
    uploads: [],
    overlayTarget: null
};

export const uploadSeed = {
    id: '',
    status: uploadStatuses.QUEUED,
    error: null,
    path: null // Will try to take globally set path if this is null
};

export const fileUpload = (state = initialState, action = {}) => {
    let numTaken = 0;
    switch (action.type) {
        case 'FILEUPLOAD_SET_PATH': return {
            ...state,
            path: action.path
        };
        case 'FILEUPLOAD_SET_STATUS': return {
            ...state,
            status: action.status
        };
        case 'FILEUPLOAD_SET_UPLOADS': return {
            ...state,
            uploads: action.uploads
        };
        case 'FILEUPLOAD_ADD_UPLOADS': return {
            ...state,
            uploads: state.uploads.concat(action.uploads)
        };
        case 'FILEUPLOAD_UPDATE_UPLOAD': return {
            ...state,
            uploads: state.uploads.map(upload => {
                if (upload.id === action.upload.id) {
                    return action.upload;
                }

                return upload;
            })
        };
        case 'FILEUPLOAD_REMOVE_UPLOAD': return {
            ...state,
            uploads: state.uploads.filter((upload, index) => {
                return index !== action.index;
            })
        };
        case 'FILEUPLOAD_TAKE_FROM_QUEUE':
            return {
                ...state,
                uploads: state.uploads.map(upload => {
                    if (upload.status === uploadStatuses.QUEUED && numTaken < action.number) {
                        numTaken++;
                        return {
                            ...upload,
                            status: uploadStatuses.UPLOADING
                        };
                    }

                    return upload;
                })
            };
        case 'FILEUPLOAD_SET_OVERLAY_TARGET':
            return {
                ...state,
                overlayTarget: action.overlayTarget
            };
        default: return state;
    }
};
