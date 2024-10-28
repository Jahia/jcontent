import React from 'react';
import {useNodeChecks} from '@jahia/data-helper';
import PropTypes from 'prop-types';
import {useApolloClient} from '@apollo/client';
import {FlushPageCacheMutation, FlushSiteCacheMutation} from './FlushCacheAction.gql-mutations';
import {useNotifications} from '@jahia/react-material';

export const FlushCacheActionComponent = ({path, render: Render, loading: Loading, showOnNodeTypes, ...others}) => {
    const client = useApolloClient();
    const notificationContext = useNotifications();
    const res = useNodeChecks(
        {path},
        {
            getIsNodeTypes: showOnNodeTypes,
            requiredPermission: ['adminCache']
        }
    );

    const isPageFlush = showOnNodeTypes.includes('jnt:page');

    if (res.loading) {
        return (Loading && <Loading {...others}/>) || false;
    }

    const isVisible = res.checksResult && showOnNodeTypes.some(nt => res?.node[nt]);

    return (
        <Render
            {...others}
            isVisible={isVisible}
            enabled={isVisible}
            onClick={() => {
                client.mutate({
                    variables: {path: path},
                    mutation: isPageFlush ? FlushPageCacheMutation : FlushSiteCacheMutation
                }).then(res => {
                    if (res?.data?.jcontent?.flush) {
                        notificationContext.notify('Cache flushed');
                    } else {
                        notificationContext.notify('Could not flush cache');
                    }
                });
            }}
        />
    );
};

FlushCacheActionComponent.propTypes = {
    path: PropTypes.string,

    render: PropTypes.func.isRequired,

    loading: PropTypes.func,

    showOnNodeTypes: PropTypes.arrayOf(PropTypes.string).isRequired
};
