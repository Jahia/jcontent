import React from 'react';
import {PageIcon, getIcon} from '@jahia/icons';

function iconRenderer(entry) {
    let Icon = getIcon(entry.node.primaryNodeType.name) || PageIcon;
    return <Icon/>;
}

export default iconRenderer;
