import React from "react";
import {ContentTypeNamesQuery, GetNodeAndChildrenByPathQuery} from "../gqlQueries";
import {translate} from "react-i18next";
import * as _ from "lodash";
import {withApollo} from 'react-apollo';
import {withNotifications} from "@jahia/react-material/index";

class UnDeleteAction extends React.Component {

    constructor(props) {

        super(props);

        this.onGwtContentUndelete = this.onGwtContentUndelete.bind(this);
    }

    onGwtContentUndelete(enginePath, engineNodeName){
        const path = enginePath.substring(0, enginePath.lastIndexOf("/") + 1) + engineNodeName;
        console.log(enginePath);
        console.log(path);
        this.props.client.query({
            query: GetNodeAndChildrenByPathQuery,
            fetchPolicy: "network-only",
            variables: {
                "path": path.substring(0, path.lastIndexOf("/")),
                "language": "en",
                "displayLanguage": "en",
            }
        });
        console.log("executed");
    }

    render() {

        let {call, children, context, ...rest} = this.props;
        let ctx = _.cloneDeep(context);

        ctx.displayName = ctx.displayName.substring(0, 100)+"...";
        ctx.onGwtContentUndelete = this.onGwtContentUndelete;

        let mixinTypesProperty = null;
        if (context.node.properties != null) {
            mixinTypesProperty = _.find(context.node.properties, property => property.name === 'jcr:mixinTypes');
        }
        if (mixinTypesProperty != null && _.includes(mixinTypesProperty.values, "jmix:markedForDeletionRoot")) {
            return children({...rest, onClick: () => call(ctx)});
        }
        return null;


    }
}

UnDeleteAction = _.flowRight(
    withNotifications(),
    translate(),
    withApollo,
)(UnDeleteAction);

export default UnDeleteAction;
