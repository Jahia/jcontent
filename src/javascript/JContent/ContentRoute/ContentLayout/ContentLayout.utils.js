import imageExtensions from 'image-extensions';
import JContentConstants from '~/JContent/JContent.constants';
import mime from 'mime'
const imageExtensionSet = new Set(imageExtensions);

export const isBrowserImage = function (node) {
    if (node.isFile) {
        let mimetype = node.content === undefined ? node.resourceChildren.nodes[0].mimeType.value : node.content.mimeType.value;
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

export const isImageFile = function (filename) {
    return imageExtensionSet.has(filename.split('.').pop().toLowerCase());
};

export const isPDF = function (node) {
    if (node.isFile) {
        let mimetype = node.content === undefined ? node.resourceChildren.nodes[0].mimeType.value : node.content.mimeType.value;
        if (mimetype === 'application/binary' || mimetype === 'application/octet-stream') {
            switch (node.path.split('.').pop().toLowerCase()) {
                case 'pdf':
                    return true;
                default:
                    return false;
            }
        }

        return mimetype.toLowerCase().indexOf('pdf') > 0;
    }

    return false;
};

export const getFileType = function (node) {
    if (node.isFile) {
        let mimetype = node.content === undefined ? node.resourceChildren.nodes[0].mimeType.value : node.content.mimeType.value;
        if (mimetype === 'application/binary' || mimetype === 'application/octet-stream') {
            return node.path.split('.').pop().toLowerCase();
        }
        else if (mimetype === 'audio/mpeg') {
            return 'mp3'
        }
        return mime.getExtension(mimetype)
    }
};

export const flattenTree = function (rows) {
    const items = [];
    collectItems(rows);
    return items;

    function collectItems(arrayData) {
        for (let i = 0; i < arrayData.length; i++) {
            items.push(arrayData[i]);
            collectItems(arrayData[i].subRows || []);
        }
    }
};

export const isInSearchMode = mode => JContentConstants.mode.SQL2SEARCH === mode || JContentConstants.mode.SEARCH === mode;
