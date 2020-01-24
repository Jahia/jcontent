import React from 'react';
import {connect} from 'react-redux';
import * as _ from 'lodash';

let count = 0;
let reduxAction = (mapStateToProps, mapDispatchToProps) => {
    let Component = connect(mapStateToProps, mapDispatchToProps)(props => props.children(_.omit(props, ['children', 'context'])));
    let id = 'reduxProps' + (count++);
    return {
        init(context, props) {
            _.assign(context, props[id]);
        },

        wrappers: [
            component => <Component>{reduxProps => React.cloneElement(component, _.set({}, id, reduxProps))}</Component>
        ]
    };
};

export {reduxAction};
