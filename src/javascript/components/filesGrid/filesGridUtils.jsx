import React from 'react';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
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

export const fileIcon = function (filename, size = 'lg', style = {}) {
    switch (filename.split('.').pop().toLowerCase()) {
        case 'png':
        case 'jpeg':
        case 'jpg':
        case 'gif':
        case 'svg':
        case 'img': return (
            <FontAwesomeIcon icon={['far', 'image']}
                             size={size}
                             color="#cecece"
                             style={style}/>
        );
        case 'avi':
        case 'mp4':
        case 'video': return (
            <FontAwesomeIcon icon={['far', 'file-video']}
                             size={size}
                             color="#cecece"
                             style={style}/>
        );
        case 'mp3':
        case 'aiff':
        case 'sound': return (
            <FontAwesomeIcon icon={['far', 'file-audio']}
                             size={size}
                             color="#cecece"
                             style={style}/>
        );
        case 'pdf': return (
            <FontAwesomeIcon icon={['far', 'file-pdf']}
                             size={size}
                             color="#cecece"
                             style={style}/>
        );
        case 'gz':
        case 'tgz':
        case 'tar.gz':
        case 'jar':
        case 'rar':
        case 'zip': return (
            <FontAwesomeIcon icon={['far', 'file-archive']}
                             size={size}
                             color="#cecece"
                             style={style}/>
        );
        case 'docx':
        case 'doc': return (
            <FontAwesomeIcon icon={['far', 'file-word']}
                             size={size}
                             color="#224288"
                             style={style}/>
        );
        case 'xlsx':
        case 'xls':
            return (
                <FontAwesomeIcon icon={['far', 'file-excel']}
                                 size={size}
                                 color="#1d6236"
                                 style={style}/>
            );
        case 'pptx':
        case 'ppt': return (
            <FontAwesomeIcon icon={['far', 'file-powerpoint']}
                             size={size}
                             color="#c5321e"
                             style={style}/>
        );
        case 'css':
        case 'java':
        case 'html': return (
            <FontAwesomeIcon icon={['far', 'file-code']}
                             size={size}
                             color="#cecece"
                             style={style}/>
        );
        case 'txt':
        case 'csv':
        case 'text': return (
            <FontAwesomeIcon icon={['far', 'file']}
                             size={size}
                             color="#cecece"
                             style={style}/>
        );
        case 'folder': return (
            <FontAwesomeIcon icon={['far', 'folder']}
                             size={size}
                             color="#cecece"
                             style={style}/>
        );
        default: return (
            <FontAwesomeIcon icon={['far', 'file-alt']}
                             size={size}
                             color="#cecece"
                             style={style}/>
        );
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
