import React from 'react';
import {DxContext} from '@jahia/react-material';

let withDxContextAction = {
    init: (context, props) => {
        context.dxContext = props.dxContext;
    },

    wrappers: [
        component => <DxContext.Consumer>{dxContext => React.cloneElement(component, {dxContext})}</DxContext.Consumer>
    ]
};

export {withDxContextAction};
