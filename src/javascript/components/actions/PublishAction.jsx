import React from "react";
import {DxContext} from "../DxContext";
import * as _ from "lodash";

class PublishAction extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        const {call, children, context, allLanguages, allSubTree, checkForUnpublication, ...rest} = this.props;
        let ctx = _.cloneDeep(context);
        ctx.uuid = [context.node.uuid];
        ctx.allLanguages = allLanguages;
        ctx.allSubTree = allSubTree;
        ctx.checkForUnpublication = checkForUnpublication;
        return <DxContext.Consumer>{dxContext => (
            children({...rest,
                labelParams: {language: dxContext.langName},
                onClick: () => call(ctx)})
        )}</DxContext.Consumer>;
    }

}

export default PublishAction;