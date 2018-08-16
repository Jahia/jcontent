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
        const actionsToDisplayKeys = _.sortBy(_.filter(Object.keys(actionsRegistry), actionKey => _.includes(actionsRegistry[actionKey].target, menuId)), "priority");

        return _.map(actionsToDisplayKeys, actionKey => {

            let action = actionsRegistry[actionKey];
            let {requiredPermission, showOnNodeTypes, hideOnNodeTypes, requiredAllowedChildNodeTypes, provideAllowedChildNodeTypes} = action;
            let requirementQueryHandler = new RequirementQueryHandler(context.path, action);
            let ActionComponent = action.component;

            return ActionComponent && (
                <Query query={requirementQueryHandler.getQuery()} variables={requirementQueryHandler.getVariables()} key={actionKey}>
                    {({loading, error, data}) => {

                        if (loading || !data || !data.jcr) {
                            return null;
                        }

                        // check display of the action
                        const node = data.jcr.nodeByPath;
                        if ((!_.isEmpty(requiredPermission) && !node.hasPermission) ||
                            (!_.isEmpty(showOnNodeTypes) && !node.isNodeType) ||
                            (!_.isEmpty(hideOnNodeTypes) && node.isNotNodeType))
                        {
                            return null;
                        }

                        // fill the context
                        if (_.isEmpty(requiredAllowedChildNodeTypes) && provideAllowedChildNodeTypes) {
                            const contributeTypes = node.contributeTypes;
                            context.nodeTypes = !contributeTypes || _.isEmpty(contributeTypes.values) ? _.map(node.allowedChildNodeTypes, type => type.name) : contributeTypes.values;
                        } else {
                            context.nodeTypes = requiredAllowedChildNodeTypes;
                        }

                        return (
                            <ActionComponent {...action} context={context}>
                                {children}
                            </ActionComponent>
                        );
                    }}
                </Query>
            );
        });
    }
}

export default Actions;
