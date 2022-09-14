import React, {useRef} from 'react';
import PropTypes from 'prop-types';
import {useDispatch} from 'react-redux';
import {batchActions} from 'redux-batched-actions';
import {
    createMissingFolders,
    fileIgnored,
    fileMatchSize,
    getDataTransferItems,
    isDragDataWithFiles,
    onFilesSelected
} from '../Upload/Upload.utils';
import {fileuploadAddUploads, fileuploadSetOverlayTarget} from '../Upload/Upload.redux';
import {UploadRequirementsQuery} from './UploadTransformComponent.gql-queries';
import JContentConstants from '~/JContent/JContent.constants';
import {ACTION_PERMISSIONS} from '../../../actions/actions.constants';
import randomUUID from 'uuid/v4';
import {uploadStatuses} from '~/JContent/ContentRoute/ContentLayout/Upload/Upload.constants';
import {useApolloClient, useQuery} from '@apollo/react-hooks';

const ACCEPTING_NODE_TYPES = ['jnt:folder', 'jnt:contentFolder'];

// Calculates elements position if/when scrolled.
// Adaptation of https://stackoverflow.com/questions/1236171/how-do-i-calculate-an-elements-position-in-a-scrolled-div
const getOverlayPosition = el => {
    let boundingClientRect = el.getBoundingClientRect();
    let position = {
        x: boundingClientRect.left,
        y: boundingClientRect.top,
        width: boundingClientRect.width,
        height: boundingClientRect.height
    };
    if (el.offsetParent && el.offsetParent.offsetTop === 0) {
        return position;
    }

    position.x = 0;
    position.y = 0;
    while (el && el.offsetParent) {
        position.x += el.offsetLeft - el.offsetParent.scrollLeft || 0;
        position.y += el.offsetTop - el.offsetParent.scrollTop || 0;
        el = el.offsetParent;
    }

    return position;
};

async function scan(fileList, uploadMaxSize, uploadMinSize, uploadPath) {
    const files = [];
    const directories = [];

    async function scanFiles(entry) {
        if (entry.isDirectory) {
            directories.push({
                path: uploadPath + entry.fullPath.substring(0, entry.fullPath.indexOf('/' + entry.name)),
                entry
            });
            let directoryReader = entry.createReader();
            const entries = await new Promise((res, rej) => {
                directoryReader.readEntries(res, rej);
            });
            await Promise.all(entries.map(entry => scanFiles(entry)));
        } else {
            const file = await new Promise((res, rej) => {
                entry.file(res, rej);
            });
            if (fileMatchSize(file, uploadMaxSize, uploadMinSize) && !fileIgnored(file)) {
                files.push({
                    path: entry.fullPath ? uploadPath + entry.fullPath.substring(0, entry.fullPath.indexOf('/' + entry.name)) : uploadPath,
                    entry,
                    file
                });
            }
        }
    }

    const entries = fileList.map(f => ({
        file: f,
        webkitEntry: f.webkitGetAsEntry()
    }));

    await Promise.all(entries.map(entry => {
        if (entry.webkitEntry) {
            return scanFiles(entry.webkitEntry);
        }

        if (fileMatchSize(entry.file, uploadMaxSize, uploadMinSize)) {
            files.push({path: uploadPath, file: entry.file});
        }

        return Promise.resolve();
    }));

    return {files, directories};
}

export const UploadTransformComponent = ({
    uploadTargetComponent: Component,
    uploadPath,
    uploadAcceptedFileTypes,
    uploadMinSize,
    uploadMaxSize,
    uploadType,
    ...props
}) => {
    const {data, loading, error} = useQuery(UploadRequirementsQuery, {
        variables: {
            path: uploadPath,
            permittedNodeTypes: ACCEPTING_NODE_TYPES,
            permission: 'jcr:addChildNodes',
            sitePermission: ACTION_PERMISSIONS.uploadFilesAction
        },
        skip: !uploadType
    });

    const allowDrop = !loading && !error && data?.jcr?.results?.hasPermission && data?.jcr?.results?.site?.hasPermission && data?.jcr?.results?.acceptsFiles;

    const client = useApolloClient();
    const dragTargets = useRef([]);
    const node = useRef();
    const dispatch = useDispatch();

    const onDragEnter = evt => {
        evt.preventDefault();

        if (allowDrop) {
            // Count the dropzone and any children that are entered.
            if (dragTargets.current.indexOf(evt.target) === -1) {
                dragTargets.current.push(evt.target);
                node.current = evt.target;
            }

            evt.persist();
            let position = getOverlayPosition(evt.currentTarget);
            dispatch(fileuploadSetOverlayTarget(position));
        }
    };

    const onDragOver = evt => {
        evt.preventDefault();
        if (allowDrop) {
            evt.persist();
        }

        return false;
    };

    const onDragLeave = evt => {
        evt.preventDefault();
        if (allowDrop) {
            evt.persist();

            dragTargets.current = dragTargets.current.filter(el => el !== evt.target && node.current.contains(el));
            if (dragTargets.current.length > 0) {
                return;
            }

            dispatch(fileuploadSetOverlayTarget(null));
        }
    };

    const onDrop = evt => {
        evt.preventDefault();
        if (allowDrop) {
            evt.persist();
            dragTargets.current = [];

            dispatch(fileuploadSetOverlayTarget(null));
            if (isDragDataWithFiles(evt)) {
                const fileList = getDataTransferItems(evt);
                if (evt.isPropagationStopped()) {
                    return;
                }

                const asyncScanAndUpload = async () => {
                    const {directories, files} = await scan(fileList, uploadMaxSize, uploadMinSize, uploadPath);
                    let acceptedFiles = files;

                    if (uploadType === JContentConstants.mode.UPLOAD) {
                        const {conflicts} = await createMissingFolders(client, directories);

                        if (conflicts.length > 0) {
                            const uploads = conflicts.map(dir => ({
                                status: uploadStatuses.HAS_ERROR,
                                error: 'FOLDER_EXISTS',
                                ...dir,
                                id: randomUUID()
                            }));
                            conflicts.forEach(dir => {
                                acceptedFiles = acceptedFiles.filter(f => !f.path.startsWith(uploadPath + dir.entry.fullPath));
                            });
                            dispatch(fileuploadAddUploads(uploads));
                        }
                    }

                    onFilesSelected({
                        acceptedFiles,
                        dispatchBatch: actions => dispatch(batchActions(actions)),
                        type: uploadType
                    });
                };

                asyncScanAndUpload().then(() => {
                });
            }
        }
    };

    return (
        <Component
            onDragOver={onDragOver}
            onDragEnter={onDragEnter}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            {...props}
        />
    );
};

UploadTransformComponent.propTypes = {
    uploadTargetComponent: PropTypes.oneOfType([PropTypes.element, PropTypes.func]).isRequired,
    uploadPath: PropTypes.string.isRequired,
    uploadType: PropTypes.string.isRequired,
    uploadAcceptedFileTypes: PropTypes.array,
    uploadMaxSize: PropTypes.number,
    uploadMinSize: PropTypes.number
};

UploadTransformComponent.defaultProps = {
    uploadMaxSize: Infinity,
    uploadMinSize: 0
};

export default UploadTransformComponent;
