import React from 'react';
import Iframe from 'react-iframe';
import {lodash as _} from "lodash";
import connect from "react-redux/es/connect/connect";
import {cmGoto} from "./redux/actions";
import actionsRegistry from "./actionsRegistry";
import {Query} from "react-apollo";
import {ActionRequirementsQueryHandler} from "./gqlQueries";

class IFrameLayout extends React.Component {

    render() {

        const { actionKey, workspace, siteKey, lang, contextPath, redirectToBrowse } = this.props;
        const action = actionsRegistry[actionKey];

        if (!action || !action.iframeUrl) {
            redirectToBrowse();
            return null;
        }

        // ensure requirements (permissions and module state on site)
        let requirementQueryHandler = new ActionRequirementsQueryHandler('/sites/' + siteKey, action, lang);
        let {requiredPermission, requireModuleInstalledOnSite} = action;

        return <Query query={requirementQueryHandler.getQuery()} variables={requirementQueryHandler.getVariables()} key={actionKey}>
            {({loading, error, data}) => {

                if (error) {
                    let message = t('label.contentManager.actions.error.loading', {details: (error.message ? error.message : '')});
                    notificationContext.notify(message, ['closeButton', 'noAutomaticClose']);
                    redirectToBrowse();
                    return null;
                }

                if (loading || !data || !data.jcr) {
                    return null;
                }

                // check display of the action
                const node = data.jcr.nodeByPath;
                if ((!_.isEmpty(requiredPermission) && !node.hasPermission) ||
                    (!_.isEmpty(requireModuleInstalledOnSite) && !_.includes(node.site.installedModulesWithAllDependencies, requireModuleInstalledOnSite))) {
                    redirectToBrowse();
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
    actionKey: state.path
});

const mapDispatchToProps = (dispatch, ownProps) => ({
    redirectToBrowse: () => dispatch(cmGoto({mode: 'browse', path: '/'}))
});

IFrameLayout = _.flowRight(
    connect(mapStateToProps, mapDispatchToProps)
)(IFrameLayout);

export {IFrameLayout};