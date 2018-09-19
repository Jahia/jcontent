import React from "react";
import * as _ from "lodash";
import actionsRegistry from "./actionsRegistry";
import {
    CheckRequirementsQuery,
    getRequirementsQuery,
    ActionRequirementsQueryHandler
} from "./gqlQueries";
import {Query, withApollo} from "react-apollo";
import {replaceFragmentsInDocument} from "@jahia/apollo-dx";
import {translate} from "react-i18next";
import {withNotifications} from "@jahia/react-material/index";
import {cmGoto} from "./redux/actions";
import connect from "react-redux/es/connect/connect";

class Actions extends React.Component {

    render() {

        const {lang, menuId, context, children, t, notificationContext, ...rest} = this.props;
        const actionsToDisplayKeys = _.sortBy(_.filter(Object.keys(actionsRegistry), actionKey => _.includes(actionsRegistry[actionKey].target, menuId)), "priority");
        const actions = _.sortBy(_.map(actionsToDisplayKeys, key => {return {...actionsRegistry[key], actionKey:key}}), "priority");
        return _.map(actions, action => {

            let ctx = _.clone(context);
            let actionKey = action.actionKey;
            let {requiredPermission, showOnNodeTypes, hideOnNodeTypes, retrieveProperties} = action;
            if (retrieveProperties != null) {
                action.retrieveProperties.retrievePropertiesLang = lang;
            }
            if (!ctx.path) {
                console.warn(`Unable to render action ${actionKey} because the context does not define a path`);
                return null;
            }
            let requirementQueryHandler = new ActionRequirementsQueryHandler(ctx.path, action, lang);
            let ActionComponent = action.component;
            if (!ActionComponent) {
                console.warn(`Unable to render action ${actionKey} because Action component ${ActionComponent} does not exists`);
                return null;
            }
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
                            <ActionComponent {...rest} {...action} actionKey={actionKey} context={ctx}>
                                {children}
                            </ActionComponent>
                        );
                    }}
                </Query>
            );
        });
    }
}

const mapStateToProps = (state, ownProps) => ({
    lang: state.language,
})

const mapDispatchToProps = (dispatch, ownProps) => ({
    setPath: (path, params) => dispatch(cmGoto({path, params}))
})

Actions = _.flowRight(
    translate(),
    withNotifications(),
    connect(mapStateToProps, mapDispatchToProps)
)(Actions);

export default Actions;
