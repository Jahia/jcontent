import imageExtensions from 'image-extensions';

const imageExtensionSet = new Set(imageExtensions);

export const valueToSizeTransformation = function (value) {
    switch (value) {
        case 1: return 2;
        case 2: return 3;
        case 3: return 4;
        case 4: return 6;
        case 5:
        default: return 12;
    }
};

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
