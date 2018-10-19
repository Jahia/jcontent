import React from "react";
import {translate} from "react-i18next";
import * as _ from "lodash";
import {withNotifications} from "@jahia/react-material/index";
import NodesInfo from './nodesInfo';
import Node from './node';

class CopyAction extends React.Component {

    render() {
        let {children, context, actionKey, ...rest} = this.props;
        return children({
                        ...rest,
                        actionKey: actionKey,
                        onClick: () => {
                            const {path, uuid, nodeName, displayName, primaryNodeType} = context;
                            NodesInfo.removeAll();
                            if (actionKey === "cut") {
                                console.log("Cut", context);
                                NodesInfo.addNode(new Node(path, uuid, nodeName, displayName, primaryNodeType, Node.PASTE_MODES.MOVE));
                            }
                            else {
                                console.log("Copy", context);
                                NodesInfo.addNode(new Node(path, uuid, nodeName, displayName, primaryNodeType, Node.PASTE_MODES.COPY));
                            }
                        }
                    });

    }
}


CopyAction = _.flowRight(
    withNotifications(),
    translate(),
)(CopyAction);

export default CopyAction;
