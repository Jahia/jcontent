import React from 'react';
import {
    Area,
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
    Group,
    Link,
    Page,
    Person,
    Section,
    Tag,
    SiteWeb
} from '@jahia/moonstone';

const imgExtensions = ['avif', 'png', 'jpeg', 'jpg', 'gif', 'svg', 'img', 'webp'];
const videoExtensions = ['avi', 'mp4', 'mkv', 'mpg', 'wmv', 'mpeg', 'mov', 'webm', 'video'];
const soundExtensions = ['mp3', 'aac', 'ogg', 'flac', 'aiff', 'sound'];
const pdfExtensions = ['pdf'];
const compressedExtensions = ['gz', 'tgz', 'tar.gz', 'jar', 'rar', 'zip'];
const wordExtensions = ['docx', 'doc'];
const excelExtensions = ['xlsx', 'xls'];
const powerPointExtensions = ['pptx', 'ppt'];
const codeExtensions = ['css', 'js', 'jsx', 'java', 'html', 'xml'];
const textExtensions = ['txt', 'csv', 'text'];
const fontExtensions = ['ttf', 'otf', 'eot', 'woff', 'woff2'];

const addIconSuffix = icon => {
    return (icon.includes('.png') ? icon : icon + '.png');
};

export function getIconFromMimeType(mimetype, props = {}) {
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
        if (codeExtensions.includes(mimetype.split('/').pop().toLowerCase())) {
            return <FileCode {...props}/>;
        }

        return <FileText {...props}/>;
    }

    return <File {...props}/>;
}

export function getIconFromPath(path, props = {}) {
    const fileExtension = path.split('.').pop().toLowerCase();

    if (imgExtensions.includes(fileExtension)) {
        return (
            <FileImage color="purple" {...props}/>
        );
    }

    if (videoExtensions.includes(fileExtension)) {
        return (
            <FileVideo color="purple" {...props}/>
        );
    }

    if (soundExtensions.includes(fileExtension)) {
        return (
            <FileSound color="purple" {...props}/>
        );
    }

    if (pdfExtensions.includes(fileExtension)) {
        return (
            <FilePdf color="red" {...props}/>
        );
    }

    if (compressedExtensions.includes(fileExtension)) {
        return (
            <FileCompresed {...props}/>
        );
    }

    if (wordExtensions.includes(fileExtension)) {
        return (
            <FileWord color="blue" {...props}/>
        );
    }

    if (excelExtensions.includes(fileExtension)) {
        return (
            <FileExcel color="green" {...props}/>
        );
    }

    if (powerPointExtensions.includes(fileExtension)) {
        return (
            <FilePowerPoint color="yellow" {...props}/>
        );
    }

    if (codeExtensions.includes(fileExtension)) {
        return (
            <FileCode {...props}/>
        );
    }

    if (textExtensions.includes(fileExtension)) {
        return (
            <FileText {...props}/>
        );
    }

    if (fontExtensions.includes(fileExtension)) {
        return (
            <FileFont {...props}/>
        );
    }

    // If no specific extension matched, return a generic file icon
    return (
        <File {...props}/>
    );
}

export function getIconFromNode(node, props = {}) {
    if (typeof node === 'undefined' || typeof node.primaryNodeType === 'undefined') {
        return <File {...props}/>;
    }

    if (node?.mixinTypes?.find(m => m.name && m.name === 'jmix:isAreaList')) {
        return <Area {...props}/>;
    }

    switch (node.primaryNodeType.name) {
        case 'jnt:folder':
            return <Folder {...props}/>;
        case 'jnt:page':
            return <Page {...props}/>;
        case 'jnt:virtualsite':
            return <SiteWeb {...props}/>;
        case 'jnt:user':
            return <Person {...props}/>;
        case 'jnt:group':
            return <Group {...props}/>;
        case 'jnt:category':
            return <Tag {...props}/>;
        case 'jnt:externalLink':
            return <Link {...props}/>;
        case 'jnt:nodeLink':
            return <Link {...props}/>;
        case 'jnt:navMenuText':
            return <Section {...props}/>;
        case 'jnt:file':
            if (node.content !== undefined || node.resourceChildren !== undefined) {
                const mimetype = node.content === undefined ? node.resourceChildren.nodes.slice(-1)[0]?.mimeType.value : node.content.mimeType.value;
                return getIconFromMimeType(mimetype, props);
            }

            return getIconFromPath(node.path, props);
        default:
            return (
                <img src={addIconSuffix(node.primaryNodeType.icon)} {...props}/>
            );
    }
}
