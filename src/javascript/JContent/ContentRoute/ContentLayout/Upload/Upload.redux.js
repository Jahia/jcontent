import {uploadsStatuses, uploadStatuses} from './Upload.constants';
import {createActions, handleActions} from 'redux-actions';
import {importContent, updateFileContent, uploadFile} from './UploadItem/UploadItem.gql-mutations';
import JContentConstants from '~/JContent/JContent.constants';

export const {fileuploadSetStatus, fileuploadSetUploads, fileuploadAddUploads, fileuploadUpdateUpload, fileuploadRemoveUpload, fileuploadTakeFromQueue} =
    createActions('FILEUPLOAD_SET_STATUS', 'FILEUPLOAD_SET_UPLOADS', 'FILEUPLOAD_ADD_UPLOADS', 'FILEUPLOAD_UPDATE_UPLOAD', 'FILEUPLOAD_REMOVE_UPLOAD', 'FILEUPLOAD_TAKE_FROM_QUEUE');

export const uploadSeed = {
    id: '',
    status: uploadStatuses.QUEUED,
    error: null,
    path: null // Will try to take globally set path if this is null
};

export const fileuploadRedux = registry => {
    const initialState = {
        status: uploadsStatuses.NOT_STARTED,
        uploads: []
    };

    const fileUpload = handleActions({
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
                    return {
                        ...upload,
                        ...action.payload
                    };
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
        }
    }, initialState);

    registry.add('redux-reducer', 'fileUpload', {targets: ['jcontent'], reducer: fileUpload});

    // Add-in the default behaviour for upload
    registry.add('fileUpload', 'import', {
        handleUpload: ({path, file, client}) => {
            return client.mutate({
                mutation: importContent,
                variables: {
                    path: path,
                    fileHandle: file,
                    rootBehaviour: 1
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
            if (filename.length > contextJsParameters.config.maxNameSize) {
                throw new Error('FILE_NAME_SIZE');
            }

            if (filename.match(JContentConstants.namingInvalidCharactersRegexp)) {
                throw new Error('FILE_NAME_INVALID');
            }

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
