import React from 'react';
import PropTypes from 'prop-types';
import {actionsRegistry, ComponentRendererProvider, DxContext, NotificationProvider} from '@jahia/react-material';
import {DSProvider} from '@jahia/design-system-kit';
import {client} from '@jahia/apollo-dx';
import {ApolloProvider} from 'react-apollo';
import {createBrowserHistory} from 'history';
import * as _ from 'lodash';
import {ConnectedRouter} from 'connected-react-router';
import {Provider} from 'react-redux';
import contentManagerReduxStore from './ContentManager.redux-store';
import PushEventHandler from './PushEventHandler';
import contentManagerActions from './ContentManager.actions';
import {registry} from '@jahia/registry';
import AppLayout from './AppLayout';
import {initClipboardWatcher} from './actions/copyPaste/localStorageHandler';
import Upload from './ContentRoute/ContentLayout/Upload';
import {refetchContentTreeAndListData} from './ContentManager.refetches';
import {withTranslation} from 'react-i18next';

class ContentManager extends React.Component {
    constructor(props) {
        super(props);
        const {dxContext} = props;
        window.forceCMUpdate = this.forceCMUpdate.bind(this);
        this.getStore = this.getStore.bind(this);
        this.getHistory = this.getHistory.bind(this);
        this.forceCMUpdate = this.forceCMUpdate.bind(this);

        contentManagerActions(actionsRegistry, this.props.t);

        _.each(dxContext.config.actions, callback => {
            if (typeof callback === 'function') {
                callback(actionsRegistry, dxContext);
            }
        });
    }

    getStore(dxContext, apolloClient, t) {
        if (!this.store) {
            this.store = contentManagerReduxStore(dxContext, this.getHistory(dxContext, t));
            initClipboardWatcher(this.store, apolloClient);
        }

        return this.store;
    }

    getHistory(dxContext) {
        if (!this.history) {
            this.history = createBrowserHistory({basename: dxContext.contextPath + dxContext.urlbase});
        }

        this.history.location.pathname = `/${window.location.pathname.split('/cmm/')[1]}`;
        return this.history;
    }

    // !!this method should never be called but is necessary until BACKLOG-8369 fixed!!
    forceCMUpdate() {
        console.warn('update application, this should not happen ..');
        this.forceUpdate();
    }

    render() {
        let {dxContext, t} = this.props;

        let apolloClient = client({
            contextPath: dxContext.contextPath,
            useBatch: true,
            httpOptions: {batchMax: 50}
        });
        return (
            <DSProvider>
                <NotificationProvider notificationContext={{}}>
                    <ApolloProvider client={apolloClient}>
                        <Provider store={this.getStore(dxContext, apolloClient, t)}>
                            <DxContext.Provider value={dxContext}>
                                <PushEventHandler/>
                                <ComponentRendererProvider>
                                    <>
                                        <ConnectedRouter history={this.getHistory(dxContext)}>
                                            <AppLayout dxContext={dxContext}/>
                                        </ConnectedRouter>
                                        <Upload uploadUpdateCallback={status => {
                                                    if (status && status.uploading === 0) {
                                                        const refetchCallbacks = registry.find({type: 'refetch-upload'});

                                                        refetchCallbacks.forEach(refetchCallback => {
                                                            if (refetchCallback.refetch) {
                                                                refetchCallback.refetch();
                                                            }
                                                        });

                                                        refetchContentTreeAndListData();
                                                    }
                                                }}/>
                                    </>
                                </ComponentRendererProvider>
                            </DxContext.Provider>
                        </Provider>
                    </ApolloProvider>
                </NotificationProvider>
            </DSProvider>
        );
    }
}

ContentManager.propTypes = {
    dxContext: PropTypes.object.isRequired,
    t: PropTypes.func.isRequired
};

export default withTranslation()(ContentManager);
