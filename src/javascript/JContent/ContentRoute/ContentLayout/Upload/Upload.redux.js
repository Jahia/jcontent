import {uploadsStatuses, uploadStatuses} from './Upload.constants';
import {createActions, handleActions} from 'redux-actions';
import {importContent, updateFileContent, uploadFile} from './UploadItem/UploadItem.gql-mutations';

export const {fileuploadSetPath, fileuploadSetStatus, fileuploadSetUploads, fileuploadAddUploads, fileuploadUpdateUpload, fileuploadRemoveUpload, fileuploadTakeFromQueue, fileuploadSetOverlayTarget} =
    createActions('FILEUPLOAD_SET_PATH', 'FILEUPLOAD_SET_STATUS', 'FILEUPLOAD_SET_UPLOADS', 'FILEUPLOAD_ADD_UPLOADS', 'FILEUPLOAD_UPDATE_UPLOAD', 'FILEUPLOAD_REMOVE_UPLOAD', 'FILEUPLOAD_TAKE_FROM_QUEUE', 'FILEUPLOAD_SET_OVERLAY_TARGET');

export const uploadSeed = {
    id: '',
    status: uploadStatuses.QUEUED,
    error: null,
    path: null // Will try to take globally set path if this is null
};

export const fileuploadRedux = registry => {
    const initialState = {
        path: null, // Folder that will get files
        status: uploadsStatuses.NOT_STARTED,
        uploads: [],
        overlayTarget: null
    };

    const fileUpload = handleActions({
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
            overlayTarget: action.payload
        })
    }, initialState);

    registry.add('redux-reducer', 'fileUpload', {targets: ['jcontent'], reducer: fileUpload});

    // Add-in the default behaviour for upload
    registry.add('fileUpload', 'import', {
        handleUpload: ({path, file, client}) => {
            return client.mutate({
                mutation: importContent,
                variables: {
                    path: path,
                    fileHandle: file
                }
            });
        }
    });

    registry.add('fileUpload', 'replace', {
        handleUpload: ({path, file, client}) => {
            return client.mutate({
                mutation: updateFileContent,
                variables: {
                    path: `${path}`,
                    mimeType: file.type,
                    fileHandle: file
                }
            }).then(data => {
                return ({
                    uuid: data?.data?.jcr?.mutateNode?.uuid
                });
            });
        }
    });

    registry.add('fileUpload', 'default', {
        handleUpload: ({path, file, filename, client}) => {
            return client.mutate({
                mutation: uploadFile,
                variables: {
                    fileHandle: file,
                    nameInJCR: filename,
                    path: path,
                    mimeType: file.type
                }
            }).then(data => {
                return ({
                    uuid: data?.data?.jcr?.addNode?.uuid
                });
            });
        }
    });
};
