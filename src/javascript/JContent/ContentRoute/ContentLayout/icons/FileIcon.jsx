import React from 'react';

import {pure} from 'recompose';
import {SvgIcon} from '@material-ui/core';

let FileIcon = () => (
    <SvgIcon viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M6 2C4.9 2 4.01 2.9 4.01 4L4 20C4 21.1 4.89 22 5.99 22H18C19.1 22 20 21.1 20 20V8L14 2H6ZM13 9V3.5L18.5 9H13Z" fill="#131C21"/>
    </SvgIcon>
);

FileIcon.displayName = 'FileIcon';
FileIcon = pure(FileIcon);
FileIcon.muiName = 'SvgIcon';

export default FileIcon;
