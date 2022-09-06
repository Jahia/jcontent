import React from 'react';
import PropTypes from 'prop-types';
import {
    File,
    FileCode,
    FileCompresed,
    FileExcel,
    FileFont,
    FileImage,
    FilePdf,
    FilePowerPoint,
    FileSound,
    FileText,
    FileVideo,
    FileWord,
    Folder,
    Page
} from '@jahia/moonstone';

const addIconSuffix = icon => {
    return (icon.includes('.png') ? icon : icon + '.png');
};

// eslint-disable-next-line complexity
export const NodeIcon = ({node, ...props}) => {
    if (typeof node === 'undefined' || typeof node.primaryNodeType === 'undefined') {
        return <File {...props}/>;
    }

    if (node.primaryNodeType.name === 'jnt:folder') {
        return <Folder {...props}/>;
    }

    if (node.primaryNodeType.name === 'jnt:page') {
        return <Page {...props}/>;
    }

    if (node.primaryNodeType.name === 'jnt:file') {
        switch (node.path.split('.').pop().toLowerCase()) {
            case 'avif':
            case 'png':
            case 'jpeg':
            case 'jpg':
            case 'gif':
            case 'svg':
            case 'img':
            case 'webp':
                return (
                    <FileImage color="purple" {...props}/>
                );

            case 'avi':
            case 'mp4':
            case 'mkv':
            case 'mpg':
            case 'wmv':
            case 'mpeg':
            case 'mov':
            case 'webm':
            case 'video':
                return (
                    <FileVideo color="purple" {...props}/>
                );

            case 'mp3':
            case 'aac':
            case 'ogg':
            case 'flac':
            case 'aiff':
            case 'sound':
                return (
                    <FileSound color="purple" {...props}/>
                );

            case 'pdf':
                return (
                    <FilePdf color="red" {...props}/>
                );

            case 'gz':
            case 'tgz':
            case 'tar.gz':
            case 'jar':
            case 'rar':
            case 'zip':
                return (
                    <FileCompresed {...props}/>
                );

            case 'docx':
            case 'doc':
                return (
                    <FileWord color="blue" {...props}/>
                );

            case 'xlsx':
            case 'xls':
                return (
                    <FileExcel color="green" {...props}/>
                );

            case 'pptx':
            case 'ppt':
                return (
                    <FilePowerPoint color="yellow" {...props}/>
                );

            case 'css':
            case 'js':
            case 'java':
            case 'html':
                return (
                    <FileCode {...props}/>
                );

            case 'txt':
            case 'csv':
            case 'text':
                return (
                    <FileText {...props}/>
                );

            case 'ttf':
            case 'otf':
            case 'eot':
            case 'woff':
            case 'woff2':
                return (
                    <FileFont {...props}/>
                );

            default:
                return (
                    <File {...props}/>
                );
        }
    }

    return (
        <img src={addIconSuffix(node.primaryNodeType.icon)} {...props}/>
    );
};

NodeIcon.propTypes = {
    node: PropTypes.shape({
        path: PropTypes.string,
        primaryNodeType: PropTypes.object
    }).isRequired
};

export default NodeIcon;
