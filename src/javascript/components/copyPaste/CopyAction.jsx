import React from "react";
import {translate} from "react-i18next";
import * as _ from "lodash";
import {withNotifications} from "@jahia/react-material/index";
import NodesInfo from './nodesInfo';
import Node from './node';

class CopyAction extends React.Component {

    render() {
        let {children, context, labelKey, ...rest} = this.props;
        return children({
                        ...rest,
                        labelKey: labelKey,
                        onClick: () => {
                            console.log(context);
                            const {path, uuid, nodeName, displayName} = context;
                            NodesInfo.removeAll();
                            NodesInfo.addNode(new Node(path, uuid, nodeName, displayName));
                        }
                    });

    }
}


CopyAction = _.flowRight(
    withNotifications(),
    translate(),
)(CopyAction);

export default CopyAction;
