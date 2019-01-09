import {
    File,
    FileDocument,
    FileExcel,
    FileImage,
    FileMusic,
    FilePdf,
    FilePowerpoint,
    FileVideo,
    FileWord,
    Folder
} from 'mdi-material-ui';
import React from 'react';

export const FileIcon = ({filename, ...props}) => {
    switch (filename.split('.').pop().toLowerCase()) {
        case 'png':
        case 'jpeg':
        case 'jpg':
        case 'gif':
        case 'svg':
        case 'img':
            return (
                <FileImage {...props}/>
            );
        case 'avi':
        case 'mp4':
        case 'video':
            return (
                <FileVideo {...props}/>
            );
        case 'mp3':
        case 'aiff':
        case 'sound':
            return (
                <FileMusic {...props}/>
            );
        case 'pdf':
            return (
                <FilePdf {...props}/>
            );
        case 'gz':
        case 'tgz':
        case 'tar.gz':
        case 'jar':
        case 'rar':
        case 'zip':
            return (
                <File {...props}/>
            );
        case 'docx':
        case 'doc':
            return (
                <FileWord {...props}/>
            );
        case 'xlsx':
        case 'xls':
            return (
                <FileExcel {...props}/>
            );
        case 'pptx':
        case 'ppt':
            return (
                <FilePowerpoint {...props}/>
            );
        case 'css':
        case 'java':
        case 'html':
            return (
                <File {...props}/>
            );
        case 'txt':
        case 'csv':
        case 'text':
            return (
                <FileDocument {...props}/>
            );
        case 'folder':
            return (
                <Folder {...props}/>
            );
        default:
            return (
                <File {...props}/>
            );
    }
};

export default FileIcon;
