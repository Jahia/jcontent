import React from 'react';
import {MuiThemeProvider} from '@material-ui/core';
import {ComponentRendererProvider, NotificationProvider, actionsRegistry} from '@jahia/react-material';
import {dsGenericTheme as theme} from '@jahia/ds-mui-theme';
import {client} from '@jahia/apollo-dx';
import {getI18n} from '@jahia/i18next';
import {I18n, I18nextProvider} from 'react-i18next';
import {Route, Switch} from 'react-router';
import {ApolloProvider} from 'react-apollo';
import {createBrowserHistory} from 'history';
import ManagerLayout from './ManagerLayout';
import LeftNavigation from './LeftNavigation';
import * as _ from 'lodash';
import DxContext from './DxContext';
import ContentLayout from './ContentLayout';
import IFrameLayout from './IFrameLayout';
import {ConnectedRouter} from 'connected-react-router';
import {Provider} from 'react-redux';
import getStore from './redux/getStore';
import PushEventHandler from './PushEventHandler';
import initActions from './actions/initActions';
import contentManagerStyleConstants from './ContentManager.style-constants';

export default class ContentManager extends React.Component {
    constructor(props) {
        super(props);
        const {dxContext} = props;
        window.forceCMUpdate = this.forceCMUpdate.bind(this);
        this.getStore = this.getStore.bind(this);
        this.getHistory = this.getHistory.bind(this);
        this.forceCMUpdate = this.forceCMUpdate.bind(this);

        initActions(actionsRegistry);

        _.each(dxContext.config.actions, callback => {
            if (typeof callback === 'function') {
                callback(actionsRegistry, dxContext);
            }
        });

        this.defaultNS = 'content-media-manager';
        this.namespaceResolvers = {
            'content-media-manager': lang => require('../../main/resources/javascript/locales/' + lang + '.json')
        };

        theme.contentManager = contentManagerStyleConstants;
    }

    getStore(dxContext, t) {
        if (!this.store) {
            this.store = getStore(dxContext, this.getHistory(dxContext, t));
        }
        return this.store;
    }

    getHistory(dxContext, t) {
        if (!this.history) {
            this.history = createBrowserHistory({basename: dxContext.contextPath + dxContext.urlbase});
            if (window.top !== window) {
                this.history.listen(location => {
                    const title = t('label.contentManager.appTitle', {path: location.pathname});
                    // Const title = 'title';
                    window.parent.history.replaceState(window.parent.history.state, title, dxContext.contextPath + dxContext.urlBrowser + location.pathname + location.search);
                    window.parent.document.title = title;
                });
            }
        }
        return this.history;
    }

    // !!this method should never be called but is necessary until BACKLOG-8369 fixed!!
    forceCMUpdate() {
        console.warn('update application, this should not happen ..');
        this.forceUpdate();
    }

    render() {
        let {dxContext} = this.props;
        // Work around to restore table headers color
        // TODO: MUST REMOVE IT BACKLOG-8697 !!!!
        return (
            <MuiThemeProvider theme={theme}>
                <NotificationProvider notificationContext={{}}>
                    <ApolloProvider client={client({contextPath: dxContext.contextPath, useBatch: true, httpOptions: {batchMax: 50}})}>
                        <I18nextProvider i18n={getI18n({
                            lng: dxContext.uilang,
                            contextPath: dxContext.contextPath,
                            ns: dxContext.i18nNamespaces,
                            defaultNS: this.defaultNS,
                            namespaceResolvers: this.namespaceResolvers
                        })}
                        >
                            <I18n>{t => {
                                return (
                                    <Provider store={this.getStore(dxContext, t)}>
                                        <DxContext.Provider value={dxContext}>
                                            <PushEventHandler/>
                                            <ComponentRendererProvider>
                                                <ConnectedRouter history={this.getHistory(dxContext, t)}>
                                                    <Route path="/:siteKey/:lang"
                                                           render={props => {
                                                        dxContext.lang = props.match.params.lang;
                                                        return (
                                                            <ManagerLayout leftSide={<LeftNavigation contextPath={dxContext.contextPath}/>}>
                                                                <Switch>
                                                                    <Route path={`${props.match.url}/apps`}
                                                                           render={() =>
                                                                               <IFrameLayout contextPath={dxContext.contextPath} workspace={dxContext.workspace}/>
                                                                    }/>
                                                                    <Route render={() =>
                                                                        <ContentLayout/>
                                                                    }/>
                                                                </Switch>
                                                            </ManagerLayout>
                                                        );
                                                    }}/>
                                                </ConnectedRouter>
                                            </ComponentRendererProvider>
                                        </DxContext.Provider>
                                    </Provider>
                                );
                            }}
                            </I18n>
                        </I18nextProvider>
                    </ApolloProvider>
                </NotificationProvider>
            </MuiThemeProvider>
        );
    }
}
