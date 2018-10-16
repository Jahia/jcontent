import React from "react";
import {translate} from "react-i18next";
import * as _ from "lodash";
import {withNotifications} from "@jahia/react-material/index";
import NodesInfo from './nodesInfo';
import Node from './node';
import {pasteNode} from "./gqlMutations";
import {Mutation} from 'react-apollo';
import {triggerRefetch, refetchTypes} from '../refetches';

class PasteAction extends React.Component {

    render() {
        let {children, context, t, labelKey, ...rest} = this.props;

        if (NodesInfo.getNodes().length === 0) {
            return null;
        }

        return (
            <Mutation
                mutation={pasteNode}>
                {(pasteNode) => {
                    return children({
                        ...rest,
                        labelKey: labelKey,
                        onClick: () => {
                            const node = NodesInfo.getNodes()[0];
                            pasteNode({variables: {
                                    pathOrId: node.path,
                                    destParentPathOrId: context.path,
                                    destName: node.displayName
                                }}).then(() => {
                                    NodesInfo.removeAll();
                                    triggerRefetch(refetchTypes.CONTENT_TREE);
                                    triggerRefetch(refetchTypes.CONTENT_DATA);
                            })
                        }
                    });
                }}
            </Mutation>
        )
    }
}


PasteAction = _.flowRight(
    withNotifications(),
    translate()
)(PasteAction);

export default PasteAction;
