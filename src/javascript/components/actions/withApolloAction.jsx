import React from 'react';
import {withApollo} from "react-apollo";

let Component = withApollo((props) => props.children(props.client));

let withApolloAction = {
    wrappers: [
        (component) => <Component context={component.props.context}>{(client) => {
            component.props.context.client = client;
            return component;
        }}</Component>
    ]
};


export { withApolloAction };