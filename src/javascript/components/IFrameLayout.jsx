import React from 'react';
import Iframe from 'react-iframe';
import {lodash as _} from "lodash";
import connect from "react-redux/es/connect/connect";
import {cmGoto} from "./redux/actions";
import {actionsRegistry} from "@jahia/react-material";
import {Query} from "react-apollo";
import {ActionRequirementsQueryHandler} from "./gqlQueries";
import {translate} from "react-i18next";
import {withNotifications} from "@jahia/react-material/index";

class IFrameLayout extends React.Component {

    showError(errorKey, errorData) {
        let { notificationContext, t } = this.props;
        let message = errorData != null ? t(errorKey, errorData) : t(errorKey);
        notificationContext.notify(message, ['closeButton', 'noAutomaticClose']);
    }

    render() {

        const { actionPath, workspace, siteKey, lang, contextPath, redirectToBrowse } = this.props;

        let actionPathParts = actionPath.split("/");
        let actionKey = actionPathParts[actionPathParts.length - 1];
        const action = actionsRegistry.get(actionKey);

        if (!action || !action.iframeUrl) {
            this.showError('label.contentManager.error.contentUnavailable');
            return null;
        }

        // ensure requirements (permissions and module state on site)
        let requirementQueryHandler = new ActionRequirementsQueryHandler({...action, path:'/sites/' + siteKey, language:lang, uiLang:lang});
        let {requiredPermission, requireModuleInstalledOnSite} = action;

        return <Query query={requirementQueryHandler.getQuery()} variables={requirementQueryHandler.getVariables()} key={actionKey}>
            {({loading, error, data}) => {

                if (error) {
                    this.showError('label.contentManager.actions.error.loading', {details: (error.message ? error.message : '')});
                    return null;
                }

                // Todo: restore loading test BACKLOG-8649
                if (!data || !data.jcr) {
                    return null;
                }

                // check display of the action
                const node = data.jcr.nodeByPath;
                if ((!_.isEmpty(requiredPermission) && !node.hasPermission) ||
                    (!_.isEmpty(requireModuleInstalledOnSite) && !_.includes(node.site.installedModulesWithAllDependencies, requireModuleInstalledOnSite)))
                {
                    this.showError('label.contentManager.error.contentUnavailable');
                    return null;
                }

                // we are good with the requirements check, let's render the IFrame
                let iframeUrl = action.iframeUrl.replace(/:context/g, contextPath);
                iframeUrl = iframeUrl.replace(/:workspace/g, workspace);
                iframeUrl = iframeUrl.replace(/:lang/g, lang);
                iframeUrl = iframeUrl.replace(/:site/g, siteKey);
                // system site uses another frame than others
                iframeUrl = iframeUrl.replace(/:frame/g, (siteKey === 'systemsite' ? 'adminframe' : 'editframe'));

                return <Iframe
                    url={iframeUrl}
                    position="relative"
                    width="100%"
                    className="myClassname"
                    height="100%"
                    allowFullScreen
                />;
            }}
        </Query>;
    }
}

const mapStateToProps = (state, ownProps) => ({
    lang: state.language,
    siteKey: state.site,
    actionPath: state.path
});

const mapDispatchToProps = (dispatch, ownProps) => ({
});

IFrameLayout = _.flowRight(
    translate(),
    withNotifications(),
    connect(mapStateToProps, mapDispatchToProps)
)(IFrameLayout);

export {IFrameLayout};