import {useApolloClient, useQuery} from '@apollo/client';
import {
    UploadRequirementsQuery
} from '~/JContent/ContentRoute/ContentLayout/UploadTransformComponent/UploadTransformComponent.gql-queries';
import {ACTION_PERMISSIONS} from '~/JContent/actions/actions.constants';
import {useDispatch} from 'react-redux';
import {useDrop} from 'react-dnd';
import {NativeTypes} from 'react-dnd-html5-backend';
import JContentConstants from '~/JContent/JContent.constants';
import {
    createMissingFolders,
    fileIgnored,
    fileMatchSize,
    onFilesSelected
} from '~/JContent/ContentRoute/ContentLayout/Upload/Upload.utils';
import {uploadStatuses} from '~/JContent/ContentRoute/ContentLayout/Upload/Upload.constants';
import {v4} from 'uuid';
import {fileuploadAddUploads} from '~/JContent/ContentRoute/ContentLayout/Upload/Upload.redux';
import {batchActions} from 'redux-batched-actions';
import mime from 'mime';

const ACCEPTING_NODE_TYPES = ['jnt:folder', 'jnt:contentFolder'];

async function scan({fileList, uploadMaxSize, uploadMinSize, uploadFilter, uploadPath}) {
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
            let file = await new Promise((res, rej) => {
                entry.file(res, rej);
            });
            if (!file.type) {
                // Crappy hack for bugged firefox
                file = new File([file], file.name, {
                    type: mime.getType(file.name)
                });
            }

            if (fileMatchSize(file, uploadMaxSize, uploadMinSize) && !fileIgnored(file) && uploadFilter(file)) {
                files.push({
                    path: entry.fullPath ? uploadPath + entry.fullPath.substring(0, entry.fullPath.indexOf('/' + entry.name)) : uploadPath,
                    entry,
                    file
                });
            }
        }
    }

    const entries = Array.from(fileList).map(f => ({
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

export function useFileDrop({uploadPath, uploadType, uploadMaxSize = Infinity, uploadMinSize = 0, uploadFilter = () => true}) {
    const {data, loading, error} = useQuery(UploadRequirementsQuery, {
        variables: {
            path: uploadPath,
            permittedNodeTypes: ACCEPTING_NODE_TYPES,
            permission: 'jcr:addChildNodes',
            sitePermission: ACTION_PERMISSIONS.uploadFilesAction
        },
        skip: !uploadType
    });
    const allowDrop = !loading && !error && data?.jcr?.results?.hasPermission && data?.jcr?.results?.site?.hasPermission && data?.jcr?.results?.acceptsFiles && !data?.jcr?.results?.lockOwner;

    const client = useApolloClient();
    const dispatch = useDispatch();

    return useDrop(() => ({
        accept: [NativeTypes.FILE],
        drop: (item, monitor) => {
            if (monitor.didDrop()) {
                return;
            }

            const fileList = item.items || item.files;

            const asyncScanAndUpload = async () => {
                const {directories, files} = await scan({fileList, uploadMaxSize, uploadMinSize, uploadFilter, uploadPath});
                let acceptedFiles = files;

                if (uploadType === JContentConstants.mode.UPLOAD) {
                    const {conflicts} = await createMissingFolders(client, directories);

                    if (conflicts.length > 0) {
                        const uploads = conflicts.map(dir => ({
                            status: uploadStatuses.HAS_ERROR,
                            error: 'FOLDER_EXISTS',
                            ...dir,
                            id: v4()
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
        },
        canDrop: (item, monitor) => allowDrop && monitor.isOver({shallow: true}),
        collect: monitor => ({
            isOver: monitor.isOver({shallow: true}),
            isCanDrop: monitor.canDrop()
        })
    }), [client, dispatch, uploadFilter, uploadPath, uploadType, uploadMaxSize, uploadMinSize, allowDrop]);
}
