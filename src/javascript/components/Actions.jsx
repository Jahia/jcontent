import React from "react";
import * as _ from "lodash";
import actionsRegistry from "./actionsRegistry";
import {
    CheckRequirementsQuery,
    getRequirementsQuery,
    RequirementQueryHandler
} from "./gqlQueries";
import {Query} from "react-apollo";
import {replaceFragmentsInDocument} from "@jahia/apollo-dx";

class Actions extends React.Component {

    render() {
        const {menuId, context, children} = this.props;
        // Filter action for the current MenuId
        const actionsToDisplayKeys = _.sortBy(_.filter(Object.keys(actionsRegistry), actionKey => _.includes(actionsRegistry[actionKey].target, menuId)), "priority");

        return _.map(actionsToDisplayKeys, actionKey => {
                let action = actionsRegistry[actionKey];
                const {requiredAllowedChildNodeTypes} = action;
                let requirementQueryHandler = new RequirementQueryHandler();
                // build the query from the action
                let query = requirementQueryHandler.getQuery(context.path, action);
                let ActionComponent = action.component;

                return ActionComponent &&
                    (
                        <Query query={query} variables={requirementQueryHandler.getVariables()} key={actionKey}>
                            {({loading, error, data}) => {
                                if (loading || !data || !data.jcr) {
                                    return null;
                                }
                                // check display of the action
                                const node = data.jcr.nodeByPath;
                                if ((requirementQueryHandler.checkPermission && !node.hasPermission) ||
                                    (requirementQueryHandler.checkShowOn && !node.isNodeType) ||
                                    (requirementQueryHandler.checkHideOn && node.isNotNodeType)) {
                                    return null;
                                }
                                // fill the context
                                if (requirementQueryHandler.checkAllowedChildNodeTypes) {
                                    const contributeTypes = node.contributeTypes;
                                    context.nodeTypes = !contributeTypes || _.isEmpty(contributeTypes.values) ? _.map(node.allowedChildNodeTypes, type => type.name) : contributeTypes.values;
                                } else {
                                    context.nodeTypes = requiredAllowedChildNodeTypes;
                                }
                                return (
                                    <ActionComponent {...action} context={context}>
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
