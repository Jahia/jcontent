import React from 'react';
import {CopyCutActionComponent} from './CopyCutActionComponent';
import copyPasteConstants from './copyPaste.constants';

const cutAction = {
    component: props => <CopyCutActionComponent {...props} type={copyPasteConstants.CUT}/>
};

export default cutAction;
