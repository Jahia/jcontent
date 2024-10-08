import imageExtensions from 'image-extensions';
import JContentConstants from '~/JContent/JContent.constants';
import mime from 'mime';
const imageExtensionSet = new Set(imageExtensions);

export const isBrowserImage = node => {
    if (node.isFile) {
        const mimetype = node.content === undefined ? node.resourceChildren.nodes[0].mimeType.value : node.content.mimeType.value;
        if (mimetype === 'application/binary' || mimetype === 'application/octet-stream') {
            switch (node.path.split('.').pop().toLowerCase()) {
                case 'avif':
                case 'png':
                case 'jpeg':
                case 'jpg':
                case 'gif':
                case 'svg':
                case 'img':
                case 'webp':
                case 'bmp':
                    return true;
                default:
                    return false;
            }
        } else {
            return mimetype.startsWith('image/');
        }
    }

    return false;
};

export const isImageFile = filename => {
    return filename.includes('.') ? imageExtensionSet.has(filename.split('.').pop().toLowerCase()) : false;
};

export const isPDF = node => {
    if (node.isFile) {
        const mimetype = node.content === undefined ? node.resourceChildren.nodes[0].mimeType.value : node.content.mimeType.value;
        if (mimetype === 'application/binary' || mimetype === 'application/octet-stream') {
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
        if (mimetype === 'application/binary' || mimetype === 'application/octet-stream') {
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
    const mimetype = node.content?.mimeType.value;
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
    return type || file.type;
};
