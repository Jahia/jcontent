import React from 'react';

import {pure} from 'recompose';
import {SvgIcon} from '@material-ui/core';

let ContentIcon = props => (
    <SvgIcon {...props} viewBox="0 0 512 512">
        <rect x="272.62" y="58" width="178.62" height="126"/>
        <polygon points="60.77 294.77 239.38 294.77 239.38 217.23 239.38 184 239.38 58 60.77 58 60.77 294.77"/>
        <rect x="272.62" y="217.23" width="178.62" height="236.77"/>
        <rect x="60.77" y="328" width="178.62" height="126"/>
    </SvgIcon>
);

ContentIcon.displayName = 'ContentIcon';
ContentIcon = pure(ContentIcon);
ContentIcon.muiName = 'SvgIcon';

export default ContentIcon;
