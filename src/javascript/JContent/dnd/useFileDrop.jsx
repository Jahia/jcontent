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
    DEFAULT_MIME_TYPE,
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

const sanitizeName = name => {
    name = name.trim();
    // Normalize Unicode and remove diacritics
    name = name.normalize('NFKD').replace(/[\u0300-\u036F]/g, '');

    // Split extension if present
    const parts = name.split('.');
    const ext = parts.length > 1 ? parts.pop().toLowerCase() : '';
    let base = parts.join('.');

    // Convert to lowercase and replace invalid characters (but keep Unicode letters/numbers)
    base = base.toLowerCase();
    base = base.replace(/[^\p{L}\p{N}._-]+/gu, '-');
    base = base.replace(/-+/g, '-');
    base = base.replace(/^[-_.]+|[-_.]+$/g, '');

    return ext ? `${base}.${ext}` : base;
};

async function scan({fileList, uploadMaxSize, uploadMinSize, uploadFilter, uploadPath}) {
    const files = [];
    const directories = [];

    async function scanFiles(entry) {
        if (entry.isDirectory) {
            directories.push({
                path: uploadPath + entry.fullPath.substring(0, entry.fullPath.lastIndexOf('/' + entry.name)),
                isFolder: true,
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
            if (!file.type || file.type === 'null') {
                // Crappy hack for bugged firefox
                let newType = file.name.includes('.') ? (mime.getType(file.name) || DEFAULT_MIME_TYPE) : DEFAULT_MIME_TYPE;
                file = new File([file], file.name, {
                    type: newType
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

    [...files, ...directories].forEach(file => {
        file.entryPath = (file.path + '/' + sanitizeName(file.entry.name)).normalize('NFC');
    });

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
                    const {cannotCreate} = await createMissingFolders(client, directories);

                    if (cannotCreate.length > 0) {
                        const uploads = cannotCreate.filter(dir => dir.error);
                        uploads.forEach(dir => {
                            dir.status = uploadStatuses.HAS_ERROR;
                            dir.subEntries = [...files, ...cannotCreate].filter(f => f.entryPath.startsWith(dir.entryPath + '/'));
                            dir.id = v4();
                        });
                        uploads.forEach(dir => {
                            acceptedFiles = acceptedFiles.filter(f => f.path !== (uploadPath + dir.entry.fullPath) && !f.path.startsWith(uploadPath + dir.entry.fullPath + '/'));
                            dir.subEntries.forEach(f => {
                                f.invalidParents = [...(f.invalidParents || []), dir.entry];
                            });
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
            isCanDrop: monitor.canDrop(),
            allowDrop
        })
    }), [client, dispatch, uploadFilter, uploadPath, uploadType, uploadMaxSize, uploadMinSize, allowDrop]);
}
