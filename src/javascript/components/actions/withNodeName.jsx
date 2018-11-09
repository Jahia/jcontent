import React from 'react';
import {map} from "rxjs/operators";
import {composeActions} from "@jahia/react-material";
import {withDxContextAction} from "./withDxContextAction";

let withNodeName = composeActions(withDxContextAction, {
    init: (context) => {
        if (context.node) {
            context.buttonLabelParams = context.node.pipe(map(node=>({displayName:node.path, language:context.dxContext.lang})))
        }
    },
});

export { withNodeName };