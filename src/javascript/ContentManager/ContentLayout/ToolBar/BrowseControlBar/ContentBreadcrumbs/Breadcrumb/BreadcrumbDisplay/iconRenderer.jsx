import React from 'react';
import {ContentIcon, getIcon} from '@jahia/icons';

function iconRenderer(node) {
    let Icon = null;
    switch (node.name) {
        case 'digitall':
            Icon = getIcon('jnt:page');
            break;
        case 'contents':
            Icon = getIcon('jnt:folder');
            break;
        case 'files':
            Icon = getIcon('jnt:folder');
            break;
        default:
            Icon = getIcon(node.type) || ContentIcon;
    }
    return <Icon/>;
}

export default iconRenderer;
