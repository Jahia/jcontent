import React from 'react';
import PropTypes from 'prop-types';
import {MuiThemeProvider} from '@material-ui/core';
import {actionsRegistry, ComponentRendererProvider, NotificationProvider, DxContext} from '@jahia/react-material';
import {dsGenericTheme as theme} from '@jahia/ds-mui-theme';
import {client} from '@jahia/apollo-dx';
import {getI18n} from '@jahia/i18next';
import {I18n, I18nextProvider} from 'react-i18next';
import {ApolloProvider} from 'react-apollo';
import {createBrowserHistory} from 'history';
import * as _ from 'lodash';
import {ConnectedRouter} from 'connected-react-router';
import {Provider} from 'react-redux';
import contentManagerReduxStore from './ContentManager.redux-store';
import PushEventHandler from './PushEventHandler';
import contentManagerActions from './ContentManager.actions';
import contentManagerStyleConstants from './ContentManager.style-constants';
import {styleConstants} from '@jahia/layouts';
import {registry} from '@jahia/registry';
import contentManagerRoutes from './ContentManager.routes';
import AppLayout from './AppLayout';

class ContentManager extends React.Component {
    constructor(props) {
        super(props);
        const {dxContext} = props;
        window.forceCMUpdate = this.forceCMUpdate.bind(this);
        this.getStore = this.getStore.bind(this);
        this.getHistory = this.getHistory.bind(this);
        this.forceCMUpdate = this.forceCMUpdate.bind(this);

        contentManagerRoutes(registry);
        contentManagerActions(actionsRegistry);

        _.each(dxContext.config.actions, callback => {
            if (typeof callback === 'function') {
                callback(actionsRegistry, dxContext);
            }
        });

        this.defaultNS = 'content-media-manager';
        this.namespaceResolvers = {
            'content-media-manager': lang => require('../../main/resources/javascript/locales/' + lang + '.json')
        };

        theme.layout = styleConstants;
        theme.contentManager = contentManagerStyleConstants;
    }

    getStore(dxContext, t) {
        if (!this.store) {
            this.store = contentManagerReduxStore(dxContext, this.getHistory(dxContext, t));
        }

        return this.store;
    }

    getHistory(dxContext, t) {
        if (!this.history) {
            this.history = createBrowserHistory({basename: dxContext.contextPath + dxContext.urlbase});
            if (window.top !== window) {
                this.history.listen(location => {
                    const title = t('label.contentManager.appTitle', {path: location.pathname});
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

        return (
            <MuiThemeProvider theme={theme}>
                <NotificationProvider notificationContext={{}}>
                    <ApolloProvider client={client({
                        contextPath: dxContext.contextPath,
                        useBatch: true,
                        httpOptions: {batchMax: 50}
                    })}
                    >
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
                                                    <AppLayout dxContext={dxContext}/>
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

ContentManager.propTypes = {
    dxContext: PropTypes.object.isRequired
};

export default ContentManager;
