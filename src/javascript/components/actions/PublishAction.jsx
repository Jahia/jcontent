import React from "react";
import * as _ from "lodash";

class PublishAction extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        const {call, children, context, allLanguages, allSubTree, checkForUnpublication, ...rest} = this.props;
        let ctx = _.cloneDeep(context);
        ctx.uuid = [context.uuid];
        ctx.allLanguages = allLanguages;
        ctx.allSubTree = allSubTree;
        ctx.checkForUnpublication = checkForUnpublication;
        return children({...rest, onClick: () => call(ctx)})
    }

}

export default PublishAction;