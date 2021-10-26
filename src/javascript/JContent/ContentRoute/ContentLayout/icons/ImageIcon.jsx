import React from 'react';

import {pure} from 'recompose';
import {SvgIcon} from '@material-ui/core';

let ImageIcon = () => (
    <SvgIcon viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path fillRule="evenodd" clipRule="evenodd" d="M4.01 4C4.01 2.9 4.9 2 6 2H14L20 8V20C20 21.1 19.1 22 18 22H5.99C4.89 22 4 21.1 4 20L4.01 4ZM13 3.5V9H18.5L13 3.5ZM9.20728 14L11.2373 16.71L14.2073 13L18.2073 18H6.20728L9.20728 14Z" fill="#131C21"/>
    </SvgIcon>
);

ImageIcon.displayName = 'ImageIcon';
ImageIcon = pure(ImageIcon);
ImageIcon.muiName = 'SvgIcon';

export default ImageIcon;
