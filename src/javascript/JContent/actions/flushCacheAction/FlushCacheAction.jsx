import React from 'react';
import {useNodeChecks} from '@jahia/data-helper';
import PropTypes from 'prop-types';
import {useApolloClient} from '@apollo/client';
import {FlushPageCacheMutation, FlushSiteCacheMutation} from './FlushCacheAction.gql-mutations';
import {useNotifications} from '@jahia/react-material';
import {useTranslation} from 'react-i18next';

const homePageProp = 'j:isHomePage';

export const FlushCacheActionComponent = ({path, render: Render, loading: Loading, showOnNodeTypes, ...others}) => {
    const {t} = useTranslation('jcontent');
    const client = useApolloClient();
    const notificationContext = useNotifications();
    const res = useNodeChecks(
        {path},
        {
            getIsNodeTypes: showOnNodeTypes,
            requiredPermission: ['adminCache'],
            getProperties: [homePageProp]
        }
    );

    const isSiteFlush = showOnNodeTypes.includes('jnt:virtualsite');
    const isHomePage = res.node && Boolean(res.node.properties.find(p => p.name === homePageProp)?.value);

    if (res.loading) {
        return (Loading && <Loading {...others}/>) || false;
    }

    const isVisible = res.checksResult && showOnNodeTypes.some(nt => res?.node[nt]) && (!isSiteFlush || isSiteFlush === isHomePage);

    return (
        <Render
            {...others}
            isVisible={isVisible}
            enabled={isVisible}
            onClick={() => {
                client.mutate({
                    variables: {path: path},
                    mutation: isSiteFlush ? FlushSiteCacheMutation : FlushPageCacheMutation
                }).then(res => {
                    if (res?.data?.jcontent?.flush) {
                        const typeOfCache = isSiteFlush ? 'flushedSiteCache' : 'flushedPageCache';
                        notificationContext.notify(t(`jcontent:label.cache.${typeOfCache}`), ['closeButton', 'closeAfter5s']);
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
