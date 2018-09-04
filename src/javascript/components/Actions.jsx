import React from "react";
import * as _ from "lodash";
import actionsRegistry from "./actionsRegistry";
import {
    CheckRequirementsQuery,
    getRequirementsQuery,
    ActionRequirementsQueryHandler
} from "./gqlQueries";
import {Query} from "react-apollo";
import {replaceFragmentsInDocument} from "@jahia/apollo-dx";
import {translate} from "react-i18next";
import {withNotifications} from "@jahia/react-material/index";

class Actions extends React.Component {

    render() {

        const {menuId, context, children, t, notificationContext, ...rest} = this.props;
        const actionsToDisplayKeys = _.sortBy(_.filter(Object.keys(actionsRegistry), actionKey => _.includes(actionsRegistry[actionKey].target, menuId)), "priority");

        return _.map(actionsToDisplayKeys, actionKey => {

            let ctx = _.clone(context);
            let action = actionsRegistry[actionKey];
            let {requiredPermission, showOnNodeTypes, hideOnNodeTypes, retrieveProperties} = action;
            if (retrieveProperties != null) {
                action.retrieveProperties.retrievePropertiesLang = ctx.lang;
            }
            let requirementQueryHandler = new ActionRequirementsQueryHandler(ctx.path, action);
            let ActionComponent = action.component;

            return ActionComponent && (
                <Query query={requirementQueryHandler.getQuery()} variables={requirementQueryHandler.getVariables()} key={actionKey}>
                    {({loading, error, data}) => {

                        if (error) {
                            let message = t('label.contentManager.actions.error.loading', {details: (error.message ? error.message : '')});
                            notificationContext.notify(message, ['closeButton', 'noAutomaticClose']);
                            return null;
                        }

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

                        ctx.node = node;
                        ctx.requirementQueryHandler = requirementQueryHandler;

                        return (
                            <ActionComponent {...rest} {...action} context={ctx}>
                                {children}
                            </ActionComponent>
                        );
                    }}
                </Query>
            );
        });
    }
}

export default  translate()(withNotifications()(Actions));
