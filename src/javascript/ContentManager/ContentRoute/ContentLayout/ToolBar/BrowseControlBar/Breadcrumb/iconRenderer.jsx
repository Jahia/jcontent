import React from 'react';
import {ContentIcon, getIcon} from '@jahia/icons';
import {Tooltip} from '@material-ui/core';

function iconRenderer(node, style, showTooltip) {
    let Icon = null;
    switch (node.name) {
        case 'Digitall':
            Icon = getIcon('jnt:page');
            break;
        case 'Contents':
            Icon = getIcon('jnt:folder');
            break;
        case 'Files':
            Icon = getIcon('jnt:folder');
            break;
        default:
            Icon = getIcon(node.type) || ContentIcon;
    }

    return showTooltip ? <Tooltip title={node.name}><Icon className={style}/></Tooltip> : <Icon className={style}/>;
}

export default iconRenderer;
