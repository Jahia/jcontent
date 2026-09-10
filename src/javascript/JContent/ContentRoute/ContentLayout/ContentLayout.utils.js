import imageExtensions from 'image-extensions';
import JContentConstants from '~/JContent/JContent.constants';
import mime from 'mime';
import {DEFAULT_MIME_TYPE} from '~/JContent/ContentRoute/ContentLayout/Upload/Upload.utils';
const imageExtensionSet = new Set(imageExtensions);

// Two different questions get asked about an image and only one of them is "can the browser show
// these bytes". A TIFF is every bit an image - it has renditions, it belongs in the media grid -
// but no browser decodes it, so pointing an <img> at the original is useless. isImage answers the
// first question, isBrowserImage the second.
const BROWSER_IMAGE_MIME_TYPES = new Set([
    'image/apng',
    'image/avif',
    'image/bmp',
    'image/gif',
    'image/jpeg',
    'image/png',
    'image/svg+xml',
    'image/vnd.microsoft.icon',
    'image/webp',
    'image/x-icon'
]);

// Same set by extension, for uploads that arrive with no usable mime type
const BROWSER_IMAGE_EXTENSIONS = new Set([
    'apng', 'avif', 'bmp', 'gif', 'ico', 'img', 'jpeg', 'jpg', 'png', 'svg', 'webp'
]);

// Images the browser cannot decode, listed so that an upload with no usable mime type is still
// recognised as an image and keeps its rendition rather than falling back to a generic icon
const NON_BROWSER_IMAGE_EXTENSIONS = new Set([
    'arw', 'cr2', 'dng', 'heic', 'heif', 'nef', 'orf', 'psb', 'psd', 'raf', 'tif', 'tiff'
]);

const getNodeMimeType = node => (node.content === undefined ?
    node.resourceChildren?.nodes?.[0]?.mimeType?.value :
    node.content?.mimeType?.value);

const getNodeExtension = node => node.path.split('.').pop().toLowerCase();

const isMimeTypeUnusable = mimetype => !mimetype || mimetype === 'application/binary' || mimetype === DEFAULT_MIME_TYPE;

/**
 * Whether the node is an image of any kind, and therefore has renditions. Used to decide between
 * showing a thumbnail and showing a generic file icon.
 */
export const isImage = node => {
    if (!node.isFile) {
        return false;
    }

    const mimetype = getNodeMimeType(node);
    if (isMimeTypeUnusable(mimetype)) {
        const extension = getNodeExtension(node);
        return BROWSER_IMAGE_EXTENSIONS.has(extension) || NON_BROWSER_IMAGE_EXTENSIONS.has(extension);
    }

    return mimetype.startsWith('image/');
};

/**
 * Whether the browser can render the node's own bytes. Used to decide whether the preview may load
 * the original file or has to fall back to a rendition, which is always PNG.
 */
export const isBrowserImage = node => {
    if (!node.isFile) {
        return false;
    }

    const mimetype = getNodeMimeType(node);
    return isMimeTypeUnusable(mimetype) ?
        BROWSER_IMAGE_EXTENSIONS.has(getNodeExtension(node)) :
        BROWSER_IMAGE_MIME_TYPES.has(mimetype.toLowerCase());
};

export const isImageFile = filename => {
    return filename.includes('.') ? imageExtensionSet.has(filename.split('.').pop().toLowerCase()) : false;
};

export const isPDF = node => {
    if (node.isFile) {
        const mimetype = node.content === undefined ? node.resourceChildren.nodes[0].mimeType.value : node.content.mimeType.value;
        if (mimetype === 'application/binary' || mimetype === DEFAULT_MIME_TYPE) {
            if (node.path.split('.').pop().toLowerCase() === 'pdf') {
                return true;
            }

            return false;
        }

        return mimetype.toLowerCase().indexOf('pdf') > 0;
    }

    return false;
};

export const getFileExtension = node => {
    if (node.isFile) {
        const mimetype = node.content === undefined ? node.resourceChildren.nodes[0].mimeType.value : node.content.mimeType.value;
        if (mimetype === 'application/binary' || mimetype === DEFAULT_MIME_TYPE) {
            return node.path.split('.').pop().toLowerCase();
        }

        if (mimetype === 'audio/mpeg') {
            return 'mp3';
        }

        return mime.getExtension(mimetype);
    }

    return undefined;
};

export const getMimeType = node => {
    const mimetype = node.content?.mimeType?.value;
    if (!mimetype || mimetype === 'null') {
        // Try to get mimetype using file extension
        return node.path.replace(/^.*[/\\]/, '').includes('.') ? mime.getType(node.path) : '';
    }

    return mimetype;
};

export const flattenTree = function (rows) {
    const items = [];
    collectItems(rows);
    return items;

    function collectItems(arrayData) {
        for (const element of arrayData) {
            items.push(element);
            collectItems(element.subRows || []);
        }
    }
};

export const isInSearchMode = mode => JContentConstants.mode.SQL2SEARCH === mode || JContentConstants.mode.SEARCH === mode;

// This util is necessary as not all browsers detect svg as image files, which they are not, technically they are xml files and can have application/svg+xml type.
// That leads to svg files not being marked as images with jmix:image mixin.
// The util is inspecting image extension as do the browsers but returns predictable results.
// Note that as with the browsers spoofing is a possibility.
export const getUploadedFileMimeType = file => {
    const type = file.name.includes('.') ? mime.getType(file.name) : null;
    if (type) {
        return type;
    }

    if (file.type && file.type !== 'null') {
        return file.type;
    }

    return DEFAULT_MIME_TYPE;
};
