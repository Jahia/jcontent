import React from 'react';
import * as _ from 'lodash';
import actionsRegistry from "./actionsRegistry"
import {CheckRequirementsQuery} from "./gqlQueries";
import {Query} from "react-apollo";

class Actions extends React.Component {

    render() {
        const {menuId, context, children} = this.props;
        // Filter action for the current MenuId
        const actionsToDisplayKeys = _.sortBy(_.filter(Object.keys(actionsRegistry), actionKey => _.includes(actionsRegistry[actionKey].target, menuId)), "priority");

        return _.map(actionsToDisplayKeys, actionKey => {
                let action = actionsRegistry[actionKey];
                const {requiredPermission, hideOnNodeTypes, showOnNodeTypes, ...actionRest} = action;
                // check permission
                const permission = requiredPermission === undefined || requiredPermission === "" ? "jcr:write" : requiredPermission;
                const hideOn = {types: hideOnNodeTypes === undefined || hideOnNodeTypes === "" ? ["dummyType"] : hideOnNodeTypes};
                const showOn = {types: showOnNodeTypes === undefined || showOnNodeTypes === "" ? ["nt:base"] : showOnNodeTypes};

                let ActionComponent = action.component;
                return ActionComponent &&
                    (
                        <Query query={CheckRequirementsQuery} variables={{
                            path: context.path,
                            permission: permission,
                            isNodeType: showOn,
                            isNotNodeType: hideOn
                        }}  key={actionKey}>
                            {({loading, error, data}) => {
                                if (loading || !data || !data.jcr) {
                                    return null;
                                }
                                if (!data.jcr.nodeByPath.perm || !data.jcr.nodeByPath.showOnType || data.jcr.nodeByPath.hideOnType) {
                                    return null;
                                }
                                return (
                                <ActionComponent {...actionRest} context={context}>
                                {children}
                                </ActionComponent>
                                )
                            }}
                        </Query>

                    )
            }
        )
    }
}

export default Actions
