import React from "react";
import {translate} from "react-i18next";
import * as _ from "lodash";
import {withNotifications} from "@jahia/react-material/index";
import Node from '../copyPaste/node';
import {connect} from "react-redux";
import { copy } from '../copyPaste/redux/actions'

class copyAction extends React.Component {

    render() {
        let {children, context, actionKey, dispatch, ...rest} = this.props;
        return children({
                        ...rest,
                        actionKey: actionKey,
                        onClick: () => {
                            const {path, uuid, nodeName, displayName, primaryNodeType} = context;
                            if (actionKey === "cut") {
                                dispatch(copy([new Node(path, uuid, nodeName, displayName, primaryNodeType, Node.PASTE_MODES.MOVE)]));
                            }
                            else {
                                dispatch(copy([new Node(path, uuid, nodeName, displayName, primaryNodeType, Node.PASTE_MODES.COPY)]));
                            }
                        }
                    });

    }
}


const mapStateToProps = (state, ownProps) => {
    return state.copyPaste;
};

const mapDispatchToProps = (dispatch) => {
    return {
        dispatch: dispatch
    }
};

copyAction = _.flowRight(
    withNotifications(),
    translate(),
    connect(mapStateToProps, mapDispatchToProps)
)(copyAction);

export default {};
