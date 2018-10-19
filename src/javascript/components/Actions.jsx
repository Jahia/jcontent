import React from "react";
import * as _ from "lodash";
import actionsRegistry from "./actionsRegistry";
import {ActionRequirementsQueryHandler} from "./gqlQueries";
import {Query} from "react-apollo";
import {translate} from "react-i18next";
import {withNotifications} from "@jahia/react-material/index";
import {cmGoto} from "./redux/actions";
import connect from "react-redux/es/connect/connect";

class Actions extends React.Component {

    render() {

        const {lang, menuId, context, children, t, notificationContext, siteKey, ...rest} = this.props;
        const actionsToDisplayKeys = _.sortBy(_.filter(Object.keys(actionsRegistry), actionKey => _.includes(actionsRegistry[actionKey].target, menuId)), "priority");
        const actions = _.sortBy(_.map(actionsToDisplayKeys, key => {return {...actionsRegistry[key], actionKey: key}}), "priority");
        return _.map(actions, action => {
            let ctx = _.clone(context);
            let {actionKey, requiredPermission, showOnNodeTypes, hideOnNodeTypes, retrieveProperties, requireModuleInstalledOnSite} = action;
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
                <Query query={requirementQueryHandler.getQuery()} variables={requirementQueryHandler.getVariables()} key={actionKey}  >
                {/*<Query query={requirementQueryHandler.getQuery()} variables={requirementQueryHandler.getVariables()} key={actionKey} fetchPolicy={"network-only"}>*/}
                    {({loading, error, data}) => {
                        if (loading) {
                            return null;
                        }

                        if (error) {
                            const message = t('label.contentManager.actions.error.loading', {details: (error.message ? error.message : '')});
                            //I commented out this notification because it was in conflict with notification in ContentData
                            //notificationContext.notify(message, ['closeButton', 'noAutomaticClose']);
                            console.error(message);
                            return null;
                        }

                        if (!data || !data.jcr) {
                            return null;
                        }

                        // check display of the action
                        const node = data.jcr.nodeByPath;
                        if ((!_.isEmpty(requiredPermission) && !node.hasPermission) ||
                            (!_.isEmpty(showOnNodeTypes) && !node.isNodeType) ||
                            (!_.isEmpty(hideOnNodeTypes) && node.isNotNodeType) ||
                            (!_.isEmpty(requireModuleInstalledOnSite) && !_.includes(node.site.installedModulesWithAllDependencies, requireModuleInstalledOnSite))) {
                            return null;
                        }
                        ctx.actionPath = (ctx.actionPath ? ctx.actionPath : "") + "/" + actionKey;
                        ctx.node = node;
                        ctx.requirementQueryHandler = requirementQueryHandler;
                        if (action.actionKey.indexOf("paste") !== -1) {
                            console.log("done", data);
                            // console.log(JSON.stringify(requirementQueryHandler.getQuery()));
                            // console.log(JSON.stringify(requirementQueryHandler.getVariables()));
                        }
                        console.log(children);
                        return <ActionComponent {...rest} {...action} actionKey={actionKey} context={ctx}>
                            {children}
                        </ActionComponent>;
                    }}
                </Query>
            );
        });
    }
}

const mapStateToProps = (state, ownProps) => ({
    lang: state.language
});

const mapDispatchToProps = (dispatch, ownProps) => ({
    setPath: (path, params) => dispatch(cmGoto({path, params}))
});

Actions = _.flowRight(
    translate(),
    withNotifications(),
    connect(mapStateToProps, mapDispatchToProps)
)(Actions);

export default Actions;
