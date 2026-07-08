import {useCallback} from 'react';
import {useApolloClient} from '@apollo/client';
import {updateFileContent, uploadFile} from '~/JContent/ContentRoute/ContentLayout/Upload/UploadItem/UploadItem.gql-mutations';
import {sanitizeName} from '~/JContent/ContentRoute/ContentLayout/Upload/Upload.utils';
import {refetchTypes, triggerRefetch} from '~/JContent/JContent.refetches';

// The edited canvas is re-encoded in the file's original format so editing never
// silently changes the stored format. Formats a canvas cannot encode fall back to
// lossless PNG (and the stored jcr:mimeType is updated accordingly).
const EXPORT_FORMATS = {
    'image/png': {extension: 'png', quality: undefined},
    'image/jpeg': {extension: 'jpeg', quality: 0.9},
    'image/webp': {extension: 'webp', quality: 0.9}
};

export const getExportFormat = mimeType => (EXPORT_FORMATS[mimeType] ?
    {mimeType, ...EXPORT_FORMATS[mimeType]} :
    {mimeType: 'image/png', ...EXPORT_FORMATS['image/png']});

const canvasToFile = async (canvas, name, format) => {
    const blob = await new Promise(resolve => canvas.toBlob(resolve, format.mimeType, format.quality));
    if (!blob) {
        throw new Error(`The edited image could not be encoded as ${format.mimeType}`);
    }

    return new File([blob], name, {type: format.mimeType});
};

/**
 * Save hooks for the Filerobot editor. Both reuse the upload feature's GraphQL
 * mutations (UploadItem.gql-mutations): `updateFileContent` to overwrite the file
 * binary in place, `uploadFile` to create a new file next to it (save as).
 *
 * @param {string} path JCR path of the image node being edited
 * @param {string} mimeType the node's current jcr:mimeType
 * @param {string} language current content language (for the new node's jcr:title)
 * @returns {{format: object, save: function, saveAs: function}}
 */
export function useSaveEditedImage(path, mimeType, language) {
    const client = useApolloClient();
    const format = getExportFormat(mimeType);

    const refresh = useCallback(nodePath => {
        // Refresh jContent: evict the node from the Apollo cache and re-run the content query.
        try {
            client.cache.flushNodeEntryByPath(nodePath);
        } catch {
            // Cache helper not installed: the JCR push event handler will refresh eventually
        }

        triggerRefetch(refetchTypes.CONTENT_DATA);
    }, [client]);

    const save = useCallback(async canvas => {
        const nodeName = decodeURIComponent(path.substring(path.lastIndexOf('/') + 1));
        const file = await canvasToFile(canvas, nodeName, format);
        await client.mutate({
            mutation: updateFileContent,
            variables: {path, mimeType: format.mimeType, fileHandle: file}
        });
        refresh(path);
    }, [client, path, format, refresh]);

    const saveAs = useCallback(async (canvas, newName) => {
        const parentPath = path.substring(0, path.lastIndexOf('/'));
        const file = await canvasToFile(canvas, newName, format);
        await client.mutate({
            mutation: uploadFile,
            variables: {
                nameInJCR: sanitizeName(newName),
                title: newName,
                lang: language,
                path: parentPath,
                mimeType: format.mimeType,
                fileHandle: file
            }
        });
        refresh(parentPath);
    }, [client, path, format, language, refresh]);

    return {format, save, saveAs};
}
