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
                const {requiredPermission, hideOnNodeTypes, showOnNodeTypes, provideType, ...actionRest} = action;
                let requirementQueryHandler = new RequirementQueryHandler();
                let query = requirementQueryHandler.getQuery(context.path, requiredPermission, hideOnNodeTypes, showOnNodeTypes, provideType);
                let ActionComponent =  action.component;

                return ActionComponent &&
                    (
                        <Query query={query} variables={requirementQueryHandler.getVariables()}  key={actionKey}>
                            {({loading, error, data}) => {
                                if (loading || !data || !data.jcr) {
                                    return null;
                                }
                                if ((requirementQueryHandler.checkPermission && !data.jcr.nodeByPath.hasPermission) ||
                                    (requirementQueryHandler.checkShowOn && !data.jcr.nodeByPath.isNodeType) ||
                                    (requirementQueryHandler.checkHideOn && data.jcr.nodeByPath.isNotNodeType)) {
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
