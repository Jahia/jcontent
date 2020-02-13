import React from 'react';
import Iframe from 'react-iframe';
import {lodash as _} from 'lodash';
import {connect} from 'react-redux';
import {ProgressOverlay, actionsRegistry, withNotifications} from '@jahia/react-material';
import {compose} from '~/utils';
import {Query} from 'react-apollo';
import {ActionRequirementsQueryHandler} from '../../JContent.gql-queries';
import {withTranslation} from 'react-i18next';
import PropTypes from 'prop-types';

export class IFrameLayout extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            iframe: null
        };
    }

    static getActionKey(actionPath) {
        let actionPathParts = actionPath.split('/');
        return actionPathParts[actionPathParts.length - 1];
    }

    onIframeLoaded(iframe) {
        this.setState({iframe});
        iframe.current.refs.iframe.contentWindow.addEventListener('hashchange', event => {
            if (sessionStorage) {
                sessionStorage.setItem('jcontentIFrameLayoutUrl', event.target.location.pathname + event.target.location.search + event.target.location.hash);
            }
        });
    }

    shouldComponentUpdate(nextProps) {
        // Unfortunately I need to test each of them as it seems that there are not all initialized when you arrive here the first time
        if (this.state.iframe &&
            this.state.iframe.current &&
            this.state.iframe.current.refs &&
            this.state.iframe.current.refs.iframe &&
            this.state.iframe.current.refs.iframe.contentWindow &&
            this.state.iframe.current.refs.iframe.contentWindow.location
        ) {
            // This is a hack to be able to listen if the URL of the iframe has changed, has when it happens the IFrameLayout try to update
            let iframeLocation = this.state.iframe.current.refs.iframe.contentWindow.location;
            if (sessionStorage &&
                sessionStorage.getItem('jcontentIFrameLayoutPathname') &&
                sessionStorage.getItem('jcontentIFrameLayoutPathname') !== iframeLocation.pathname
            ) {
                sessionStorage.setItem('jcontentIFrameLayoutUrl', iframeLocation.pathname + iframeLocation.search + iframeLocation.hash);
                sessionStorage.setItem('jcontentIFrameLayoutPathname', iframeLocation.pathname);
            }
        }

        // We want to update only if the action key is different
        // otherwise it will update the component and we won't know if it's a reload or just an useless update
        const currentActionKey = IFrameLayout.getActionKey(this.props.actionPath);
        const nextActionKey = IFrameLayout.getActionKey(nextProps.actionPath);

        return currentActionKey !== nextActionKey ||
            this.props.lang !== nextProps.lang ||
            this.props.siteKey !== nextProps.siteKey ||
            this.props.workspace !== nextProps.workspace;
    }

    showError(errorKey, errorData) {
        let {notificationContext, t} = this.props;
        let message = errorData === null ? t(errorKey) : t(errorKey, errorData);
        notificationContext.notify(message, ['closeButton', 'noAutomaticClose']);
    }

    render() {
        const {actionPath, workspace, siteKey, lang, contextPath} = this.props;

        const actionKey = IFrameLayout.getActionKey(actionPath);
        const action = actionsRegistry.get(actionKey);

        if (!action || !action.iframeUrl) {
            this.showError('label.contentManager.error.contentUnavailable');
            return null;
        }

        let sitePath = '/sites/' + siteKey;

        // Ensure requirements (permissions and module state on site)
        let context = {...action, path: sitePath, language: lang, uilang: lang};
        let requirementQueryHandler = new ActionRequirementsQueryHandler(context);
        let {requiredPermission, requireModuleInstalledOnSite} = action;

        return (
            <Query
                key={actionKey}
                query={requirementQueryHandler.getQuery()}
                variables={requirementQueryHandler.getVariables()}
            >
                {({error, data, loading}) => {
                    if (error) {
                        this.showError('label.contentManager.actions.error.loading', {details: (error.message ? error.message : '')});
                        return null;
                    }

                    // For some reason loading sometime returns true even if have the right data,
                    // so to avoid this issue we combined loading with a check on the data.
                    // Also a wrong (likely previously cached) site node might be supplied while loading new data.
                    // Associated tickets https://jira.jahia.org/browse/QA-11271 and https://jira.jahia.org/browse/BACKLOG-8649
                    if (loading &&
                        (!data || !data.jcr || !data.jcr.nodeByPath || data.jcr.nodeByPath.path !== sitePath)
                    ) {
                        return <ProgressOverlay/>;
                    }

                    const siteNode = data.jcr.nodeByPath;
                    // Check display of the action
                    if ((!_.isEmpty(requiredPermission) && !siteNode.hasPermission) ||
                        (!_.isEmpty(requireModuleInstalledOnSite) && !_.includes(siteNode.site.installedModulesWithAllDependencies, requireModuleInstalledOnSite))
                    ) {
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

                    // Check session storage to see if we already have an URL for this action key, otherwise update session storage
                    if (sessionStorage) {
                        if (sessionStorage.getItem('jcontentIFrameLayoutActionKey') &&
                            sessionStorage.getItem('jcontentIFrameLayoutActionKey') === actionKey &&
                            sessionStorage.getItem('jcontentIFrameLayoutSiteKey') === siteKey &&
                            sessionStorage.getItem('jcontentIFrameLayoutWorkspace') === workspace &&
                            sessionStorage.getItem('jcontentIFrameLayoutLang') === lang &&
                            sessionStorage.getItem('jcontentIFrameLayoutUrl')
                        ) {
                            iframeUrl = sessionStorage.getItem('jcontentIFrameLayoutUrl');
                        } else {
                            sessionStorage.setItem('jcontentIFrameLayoutActionKey', actionKey);
                            sessionStorage.setItem('jcontentIFrameLayoutUrl', iframeUrl);
                            sessionStorage.setItem('jcontentIFrameLayoutPathname', iframeUrl);
                            sessionStorage.setItem('jcontentIFrameLayoutSiteKey', siteKey);
                            sessionStorage.setItem('jcontentIFrameLayoutWorkspace', workspace);
                            sessionStorage.setItem('jcontentIFrameLayoutLang', lang);
                        }
                    }

                    let iframe = React.createRef();
                    return (
                        <Iframe
                            ref={iframe}
                            allowFullScreen
                            url={iframeUrl}
                            position="relative"
                            width="100%"
                            className="myClassname"
                            height="100%"
                            onLoad={() => this.onIframeLoaded(iframe)}
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
    actionPath: state.jcontent.path
});

const mapDispatchToProps = () => ({});

IFrameLayout.propTypes = {
    actionPath: PropTypes.string.isRequired,
    contextPath: PropTypes.string.isRequired,
    lang: PropTypes.string.isRequired,
    siteKey: PropTypes.string.isRequired,
    workspace: PropTypes.string.isRequired,
    notificationContext: PropTypes.object.isRequired,
    t: PropTypes.func.isRequired
};

export default compose(
    withTranslation(),
    withNotifications(),
    connect(mapStateToProps, mapDispatchToProps)
)(IFrameLayout);
