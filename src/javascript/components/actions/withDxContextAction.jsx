import React from 'react';
import {DxContext} from "../DxContext";

let withDxContextAction = {
    wrappers: [
        (component) => <DxContext.Consumer>{dxContext => {
            component.props.context.dxContext = dxContext;
            return component;
        }}</DxContext.Consumer>
    ]
};


export { withDxContextAction };