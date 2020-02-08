import {createActions} from 'redux-actions';

export const {fileuploadSetPath, fileuploadSetStatus, fileuploadSetUploads, fileuploadAddUploads, fileuploadUpdateUpload, fileuploadRemoveUpload, fileuploadTakeFromQueue, fileuploadSetOverlayTarget} =
    createActions('FILEUPLOAD_SET_PATH', 'FILEUPLOAD_SET_STATUS', 'FILEUPLOAD_SET_UPLOADS', 'FILEUPLOAD_ADD_UPLOADS', 'FILEUPLOAD_UPDATE_UPLOAD', 'FILEUPLOAD_REMOVE_UPLOAD', 'FILEUPLOAD_TAKE_FROM_QUEUE', 'FILEUPLOAD_SET_OVERLAY_TARGET')
