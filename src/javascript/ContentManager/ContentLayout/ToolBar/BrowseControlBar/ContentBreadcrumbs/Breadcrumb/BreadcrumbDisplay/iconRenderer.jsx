import React from 'react';
import {ContentIcon, getIcon} from '@jahia/icons';

function iconRenderer(node, style) {
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
    return <Icon className={style}/>;
}

export default iconRenderer;
