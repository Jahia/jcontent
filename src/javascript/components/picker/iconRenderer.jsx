import React from 'react';
import * as _ from 'lodash';
import PageIcon from '@jahia/icons/PageIcon';
import {getIcon} from '@jahia/icons/iconRegistry';

function iconRenderer(entry) {
    let Icon = getIcon(entry.node.primaryNodeType.name) || PageIcon;
    return <Icon/>
}

export default iconRenderer;
