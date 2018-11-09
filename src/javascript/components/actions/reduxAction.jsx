import React from 'react';
import {connect} from "react-redux";
import * as _ from 'lodash';

let reduxAction = (mapStateToProps, mapDispatchToProps) => {
    let Component = connect(mapStateToProps, mapDispatchToProps)((props) => props.children(_.omit(props, ['children', 'context'])));

    return {
        init(context,props) {
            _.assign(context, props.reduxProps);
        },

        wrappers: [
            (component) => <Component>{(reduxProps) => React.cloneElement(component, {reduxProps})}</Component>
        ]
    }
};


export { reduxAction };