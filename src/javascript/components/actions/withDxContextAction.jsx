import React from 'react';
import {DxContext} from "../DxContext";

let withDxContextAction = {
    init: (context,props) => {
        context.dxContext = props.dxContext;
    },

    wrappers: [
        (component) => <DxContext.Consumer>{dxContext => React.cloneElement(component, {dxContext})}</DxContext.Consumer>
    ]
};


export { withDxContextAction };