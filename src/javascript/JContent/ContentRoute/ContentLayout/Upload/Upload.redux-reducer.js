import {uploadsStatuses, uploadStatuses} from './Upload.constants';
import {handleActions} from 'redux-actions';
import {
    fileuploadAddUploads,
    fileuploadRemoveUpload,
    fileuploadSetOverlayTarget,
    fileuploadSetPath,
    fileuploadSetStatus,
    fileuploadSetUploads,
    fileuploadTakeFromQueue,
    fileuploadUpdateUpload
} from './Upload.redux-actions';

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

export const fileUpload = handleActions({
    [fileuploadSetPath]: (state, action) => ({
        ...state,
        path: action.payload
    }),
    [fileuploadSetStatus]: (state, action) => ({
        ...state,
        status: action.payload
    }),
    [fileuploadSetUploads]: (state, action) => ({
        ...state,
        uploads: action.payload
    }),
    [fileuploadAddUploads]: (state, action) => ({
        ...state,
        uploads: state.uploads.concat(action.payload)
    }),
    [fileuploadUpdateUpload]: (state, action) => ({
        ...state,
        uploads: state.uploads.map(upload => {
            if (upload.id === action.payload.id) {
                return action.payload;
            }

            return upload;
        })
    }),
    [fileuploadRemoveUpload]: (state, action) => ({
        ...state,
        uploads: state.uploads.filter((upload, index) => {
            return index !== action.payload;
        })
    }),
    [fileuploadTakeFromQueue]: (state, action) => {
        let numTaken = 0;
        return {
            ...state,
            uploads: state.uploads.map(upload => {
                if (upload.status === uploadStatuses.QUEUED && numTaken < action.payload) {
                    numTaken++;
                    return {
                        ...upload,
                        status: uploadStatuses.UPLOADING
                    };
                }

                return upload;
            })
        };
    },
    [fileuploadSetOverlayTarget]: (state, action) => ({
        ...state,
        overlayTarget: action.overlayTarget
    })
}, initialState);
