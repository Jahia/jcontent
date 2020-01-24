import React from 'react';

import {pure} from 'recompose';
import {SvgIcon} from '@material-ui/core';

let WorkflowIcon = props => (
    <SvgIcon {...props} viewBox="0 0 512 512">
        <circle cx="147.4" cy="310.3" r="72.4"/>
        <circle cx="319.35" cy="391.75" r="45.25" transform="translate(-118.5 644.22) rotate(-80.78)"/>
        <circle cx="328.4" cy="183.6" r="108.6"/>
    </SvgIcon>
);

WorkflowIcon.displayName = 'WorkflowIcon';
WorkflowIcon = pure(WorkflowIcon);
WorkflowIcon.muiName = 'SvgIcon';

export default WorkflowIcon;
