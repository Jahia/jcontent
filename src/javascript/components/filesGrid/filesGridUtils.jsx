import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export const valueToSizeTransformation = function(value) {
    switch(value) {
        case 1 : return 2;
        case 2 : return 3;
        case 3 : return 4;
        case 4 : return 6;
        case 5 :
        default : return 12;
    }
};


export const fileIcon = function(filename, size = "lg"){
    switch (filename.split('.').pop().toLowerCase()) {
        case "png":
        case "jpeg":
        case "jpg":
        case "gif":
        case "img": return <FontAwesomeIcon icon={ "image" } size={ size }/>;
        case "avi":
        case "mp4":
        case "video": return <FontAwesomeIcon icon={ "video" } size={ size }/>;
        case "mp3":
        case "aiff":
        case "sound": return <FontAwesomeIcon icon={ "file-audio" } size={ size }/>;
        case "pdf": return <FontAwesomeIcon icon={ "file-pdf" } size={ size }/>;
        case "gz":
        case "tgz":
        case "tar.gz":
        case "jar":
        case "rar":
        case "zip": return <FontAwesomeIcon icon={ "file-archive" } size={ size } color={ "darkgoldenrod" }/>;
        case "docx":
        case "doc": return <FontAwesomeIcon icon={ "file-word" } size={ size } color={ "mediumblue" }/>;
        case "xls": return <FontAwesomeIcon icon={ "file-excel" } size={ size } color={ "green" }/>;
        case "pptx":
        case "ppt": return <FontAwesomeIcon icon={ "file-powerpoint" } size={ size } color={ "orangered" }/>;
        case "css":
        case "java":
        case "html": return <FontAwesomeIcon icon={ "file-code" } size={ size } color={ "mediumpurple" }/>;
        case "txt":
        case "csv":
        case "text": return <FontAwesomeIcon icon={ "file" } size={ size } />;
        case "folder": return <FontAwesomeIcon icon={ "folder" } size={ size } />;
        default: return <FontAwesomeIcon icon={ "file-alt" } size={ size } />;
    }
};