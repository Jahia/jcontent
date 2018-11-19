import {uploadSeed} from "./redux/reducer";
import {takeFromQueue, addUploads } from "./redux/actions";
import {NUMBER_OF_SIMULTANEOUS_UPLOADS} from "./constatnts";
import accepts from "attr-accept";
import mimetypes from "mime-types";
import randomUUID from 'uuid/v4';

export const files = {
    acceptedFiles: [],
    rejectedFiles: []
};

export const onFilesSelected = (acceptedFiles, rejectedFiles, dispatchBatch, uploadInfo, additionalActions = []) => {
    files.acceptedFiles = files.acceptedFiles.concat(acceptedFiles);
    files.rejectedFiles = files.rejectedFiles.concat(rejectedFiles);
    const uploads = acceptedFiles.map((file) => {
        let seed = {
            ...uploadSeed
        };

        seed.id = randomUUID();

        //Merge optional uploadInfo if custom property values need to be provided
        if (uploadInfo) {
            seed = {
                ...seed,
                ...uploadInfo
            }
        }
        return seed;
    });

    dispatchBatch(additionalActions.concat([
        addUploads(uploads),
        takeFromQueue(NUMBER_OF_SIMULTANEOUS_UPLOADS)])
    );
};

export const isDragDataWithFiles = (evt) => {
    if (!evt.dataTransfer) {
        return true
    }
    // https://developer.mozilla.org/en-US/docs/Web/API/DataTransfer/types
    // https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API/Recommended_drag_types#file
    return Array.prototype.every.call(
        evt.dataTransfer.types,
        type => type === 'Files' || type === 'application/x-moz-file'
    )
};

export const getDataTransferItems = (event) => {
    let dataTransferItemsList = [];
    if (event.dataTransfer) {
        const dt = event.dataTransfer;

        // NOTE: Only the 'drop' event has access to DataTransfer.files,
        // otherwise it will always be empty
        if (dt.files && dt.files.length) {
            dataTransferItemsList = dt.files
        } else if (dt.items && dt.items.length) {
            // During the drag even the dataTransfer.files is null
            // but Chrome implements some drag store, which is accessible via dataTransfer.items
            dataTransferItemsList = dt.items
        }
    } else if (event.target && event.target.files) {
        dataTransferItemsList = event.target.files
    }

    // Convert from DataTransferItemsList to the native Array
    return Array.prototype.slice.call(dataTransferItemsList)
};

export const fileAccepted = (file, accept) => {
    return file.type === 'application/x-moz-file' || accepts(file, accept)
};

export const fileMatchSize = (file, maxSize, minSize) => {
    return file.size <= maxSize && file.size >= minSize
};

export const getMimeTypes = (acceptedFileTypes) => {
    if (acceptedFileTypes) {
        return acceptedFileTypes.map((type) => {
            return mimetypes.lookup(type);
        });
    }
    return undefined;
};