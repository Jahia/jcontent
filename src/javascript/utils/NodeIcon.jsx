import React from 'react';
import PropTypes from 'prop-types';
import {
    File,
    FileCode,
    FileCompresed,
    FileDoc,
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
        if (node.content !== undefined || node.resourceChildren !== undefined) {
            let mimetype = node.content === undefined ? node.resourceChildren.nodes.pop().mimeType.value : node.content.mimeType.value;
            if (mimetype.startsWith('image/')) {
                return (
                    <FileImage color="purple" {...props}/>
                );
            }

            if (mimetype.startsWith('video/')) {
                return (
                    <FileVideo color="purple" {...props}/>
                );
            }

            if (mimetype.startsWith('audio/')) {
                return (
                    <FileSound color="purple" {...props}/>
                );
            }

            if (mimetype.indexOf('pdf') > 0) {
                return (
                    <FilePdf color="red" {...props}/>
                );
            }

            if (mimetype.indexOf('zip') > 0 || mimetype.indexOf('archive') > 0) {
                return (
                    <FileCompresed {...props}/>
                );
            }

            if (mimetype.indexOf('presentation') > 0) {
                return (
                    <FilePowerPoint color="yellow" {...props}/>
                );
            }

            if (mimetype.indexOf('spreadsheet') > 0 || mimetype.indexOf('sheet') > 0) {
                return (
                    <FileExcel color="green" {...props}/>
                );
            }

            if (mimetype.indexOf('document') > 0) {
                return (
                    <FileDoc color="blue" {...props}/>
                );
            }

            if (mimetype.startsWith('text/')) {
                switch (mimetype.split('/').pop().toLowerCase()) {
                    case 'css':
                    case 'js':
                    case 'jsx':
                    case 'java':
                    case 'html':
                    case 'xml':
                        return (
                            <FileCode {...props}/>
                        );

                    default:
                        return (
                            <FileText {...props}/>
                        );
                }
            }
        } else {
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
    }

    return (
        <img src={addIconSuffix(node.primaryNodeType.icon)} {...props}/>
    );
};

NodeIcon.propTypes = {
    node: PropTypes.shape({
        path: PropTypes.string,
        primaryNodeType: PropTypes.object,
        content: PropTypes.object,
        resourceChildren: PropTypes.object
    }).isRequired
};

export default NodeIcon;
