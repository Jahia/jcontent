import React from 'react';
import * as _ from 'lodash';
import * as icons from '@jahia/icons'

function iconRenderer(entry) {
    let Icon = _.find(icons, icon => icon.primaryNodeType === entry.node.primaryNodeType.name) || icons.PageIcon;
    return <Icon/>
}

export default iconRenderer;
