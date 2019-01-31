import React from 'react';
import Iframe from 'react-iframe';
import {lodash as _} from 'lodash';
import {connect} from 'react-redux';
import {ProgressOverlay, actionsRegistry, withNotifications} from '@jahia/react-material';
import {compose, Query} from 'react-apollo';
import {ActionRequirementsQueryHandler} from '../ContentManager.gql-queries';
import {translate} from 'react-i18next';
import {styleConstants} from '@jahia/layouts';

export class IFrameLayout extends React.Component {
    showError(errorKey, errorData) {
        let {notificationContext, t} = this.props;
        let message = errorData !== null ? t(errorKey, errorData) : t(errorKey);
        notificationContext.notify(message, ['closeButton', 'noAutomaticClose']);
    }

    render() {
        const {actionPath, workspace, siteKey, lang, contextPath} = this.props;

        let actionPathParts = actionPath.split('/');
        let actionKey = actionPathParts[actionPathParts.length - 1];
        const action = actionsRegistry.get(actionKey);

        if (!action || !action.iframeUrl) {
            this.showError('label.contentManager.error.contentUnavailable');
            return null;
        }

        let sitePath = '/sites/' + siteKey;

        // Ensure requirements (permissions and module state on site)
        let context = {...action, path: sitePath, language: lang, uiLang: lang};
        let requirementQueryHandler = new ActionRequirementsQueryHandler(context);
        let {requiredPermission, requireModuleInstalledOnSite} = action;

        return (
            <Query key={actionKey}
                   query={requirementQueryHandler.getQuery()}
                   variables={requirementQueryHandler.getVariables()}
            >
                {({error, data, loading}) => {
                    if (error) {
                        this.showError('label.contentManager.actions.error.loading', {details: (error.message ? error.message : '')});
                        return null;
                    }

                    if (loading) {
                        return <ProgressOverlay/>;
                    }

                    if (!data || !data.jcr) {
                        return <ProgressOverlay/>;
                    }

                    // The data check above related to the BACKLOG-8649 is not fully reliable,
                    // so a wrong (likely previously cached) site node might be supplied while loading new data.
                    // Return null in this case as data are still loading so it is too early to render anything.
                    const site = data.jcr.nodeByPath;
                    if (!site || site.path !== sitePath) {
                        return <ProgressOverlay/>;
                    }

                    // Check display of the action
                    if ((!_.isEmpty(requiredPermission) && !site.hasPermission) ||
                        (!_.isEmpty(requireModuleInstalledOnSite) && !_.includes(site.site.installedModulesWithAllDependencies, requireModuleInstalledOnSite))) {
                        this.showError('label.contentManager.error.contentUnavailable');
                        return null;
                    }

                    // We are good with the requirements check, let's render the IFrame
                    let iframeUrl = action.iframeUrl.replace(/:context/g, contextPath);
                    iframeUrl = iframeUrl.replace(/:workspace/g, workspace);
                    iframeUrl = iframeUrl.replace(/:lang/g, lang);
                    iframeUrl = iframeUrl.replace(/:site/g, siteKey);
                    // System site uses another frame than others
                    iframeUrl = iframeUrl.replace(/:frame/g, (siteKey === 'systemsite' ? 'adminframe' : 'editframe'));

                    return (
                        <Iframe allowFullScreen
                                url={iframeUrl}
                                position="relative"
                                width="100%"
                                className="myClassname"
                                height={'calc( 100% - ' + styleConstants.topBarHeight + 'px )'}
                        />
                    );
                }}
            </Query>
        );
    }
}

const mapStateToProps = state => ({
    lang: state.language,
    siteKey: state.site,
    actionPath: state.path
});

const mapDispatchToProps = () => ({});

export default compose(
    translate(),
    withNotifications(),
    connect(mapStateToProps, mapDispatchToProps)
)(IFrameLayout);
