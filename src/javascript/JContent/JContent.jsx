import React from 'react';
import PropTypes from 'prop-types';
import {ComponentRendererProvider, DxContext, NotificationProvider} from '@jahia/react-material';
import {ComponentRendererProvider as NewComponentRendererProvider, registry} from '@jahia/ui-extender';
import {DSProvider} from '@jahia/design-system-kit';
import {client} from '@jahia/apollo-dx';
import {ApolloProvider} from 'react-apollo';
import PushEventHandler from './PushEventHandler';
import AppLayout from './AppLayout';
import Upload from './ContentRoute/ContentLayout/Upload';
import {refetchContentTreeAndListData} from './JContent.refetches';

class JContent extends React.Component {
    constructor(props) {
        super(props);
        window.forceCMUpdate = this.forceCMUpdate.bind(this);
        this.forceCMUpdate = this.forceCMUpdate.bind(this);
    }

    // !!this method should never be called but is necessary until BACKLOG-8369 fixed!!
    forceCMUpdate() {
        console.warn('update application, this should not happen ..');
        this.forceUpdate();
    }

    render() {
        let {dxContext} = this.props;

        let apolloClient = client({
            contextPath: dxContext.contextPath,
            useBatch: true,
            httpOptions: {batchMax: 50}
        });
        return (
            <DSProvider>
                <NotificationProvider notificationContext={{}}>
                    <ApolloProvider client={apolloClient}>
                        <DxContext.Provider value={dxContext}>
                            <PushEventHandler/>
                            <ComponentRendererProvider>
                                <NewComponentRendererProvider>
                                    <>
                                        <AppLayout dxContext={dxContext}/>
                                        <Upload
                                            dxContext={dxContext}
                                            uploadUpdateCallback={status => {
                                                if (status && status.uploading === 0) {
                                                    const refetchCallbacks = registry.find({type: 'refetch-upload'});
                                                    refetchCallbacks.forEach(refetchCallback => {
                                                        if (refetchCallback.refetch) {
                                                            refetchCallback.refetch();
                                                        }
                                                    });

                                                    refetchContentTreeAndListData();
                                                }
                                            }}
                                        />
                                    </>
                                </NewComponentRendererProvider>
                            </ComponentRendererProvider>
                        </DxContext.Provider>
                    </ApolloProvider>
                </NotificationProvider>
            </DSProvider>
        );
    }
}

JContent.propTypes = {
    dxContext: PropTypes.object.isRequired
};

export default JContent;
