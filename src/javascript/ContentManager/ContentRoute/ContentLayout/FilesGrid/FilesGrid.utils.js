import imageExtensions from 'image-extensions';

const imageExtensionSet = new Set(imageExtensions);

export const isBrowserImage = function (filename) {
    switch (filename.split('.').pop().toLowerCase()) {
        case 'png':
        case 'jpeg':
        case 'jpg':
        case 'gif':
        case 'img':
        case 'svg':
        case 'bmp':
            return true;
        default:
            return false;
    }
};

export const isImageFile = function (filename) {
    return imageExtensionSet.has(filename.split('.').pop().toLowerCase());
};

export const isPDF = function (filename) {
    return filename.split('.').pop().toLowerCase() === 'pdf';
};

export const getFileType = function (filename) {
    return filename.split('.').pop().toLowerCase();
};
