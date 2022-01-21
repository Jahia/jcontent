import imageExtensions from 'image-extensions';
import JContentConstants from '~/JContent/JContent.constants';

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

export const structureData = function (parentPath, dataForParentPath = []) {
    const structuredData = dataForParentPath.filter(d => d.parent.path === parentPath);
    setSubrows(structuredData, dataForParentPath);
    return structuredData;

    // Recursively finds and puts children of data[i] in data[i].subRows
    function setSubrows(data, unstructuredData) {
        for (let i = 0; i < data.length; i++) {
            data[i].subRows = [];
            const rest = [];
            for (let j = 0; j < unstructuredData.length; j++) {
                if (data[i].path === unstructuredData[j].parent.path) {
                    data[i].subRows.push(unstructuredData[j]);
                } else {
                    rest.push(unstructuredData[j]);
                }
            }

            setSubrows(data[i].subRows, rest);
        }
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
