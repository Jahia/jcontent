import React, {useContext, useMemo} from 'react';
import PropTypes from 'prop-types';
import {ApolloClient, ApolloProvider, getApolloContext, HttpLink, InMemoryCache} from '@apollo/client';
import {Provider as ReduxProvider, ReactReduxContext} from 'react-redux';
import {NotificationProvider, useNotifications} from '@jahia/react-material';

/**
 * Read-only store shim used only when the host page has no redux Provider at all
 * (i.e. the panel is mounted outside the Jahia app shell React tree). The side panel
 * only *reads* `uilang` (content history, form definition); dispatches coming from
 * nested actions are intentionally inert in that mode.
 */
const createStaticStore = state => ({
    getState: () => state,
    subscribe: () => () => {},
    dispatch: action => action
});

/**
 * Interface implementors of the DXM GraphQL schema (see schema.graphql).
 *
 * Apollo Client 3 dropped heuristic fragment matching: without this map a fragment declared
 * on an interface — and every jContent query spreads `...NodeCacheRequiredFields on JCRNode`
 * — matches nothing, and its fields (uuid, path, workspace) are silently stripped from the
 * result. The app shell's own client carries the same information, so this only matters for
 * the fallback client. Keep in sync with the `implements` clauses of schema.graphql
 * (3 interfaces, no unions at the time of writing).
 */
export const POSSIBLE_TYPES = {
    JCRNode: ['GenericJCRNode', 'JCRSite', 'VanityUrl'],
    JCRItemDefinition: ['JCRNodeDefinition', 'JCRPropertyDefinition'],
    Principal: ['Group', 'User']
};

const createFallbackClient = () => new ApolloClient({
    link: new HttpLink({
        uri: `${window.contextJsParameters?.contextPath || ''}/modules/graphql`,
        credentials: 'same-origin'
    }),
    cache: new InMemoryCache({possibleTypes: POSSIBLE_TYPES})
});

/**
 * Fills in the providers the side panel tabs need, but *only* the ones missing from
 * the host tree. Mounted inside the Jahia app shell (the nominal case) every provider
 * is already there and this component is a pass-through, so the panel keeps sharing the
 * shell's Apollo cache, redux store and notification queue.
 *
 * Not filled in: i18next (react-i18next falls back to the shared default instance the
 * app shell initialises; without it labels degrade to their keys) and the moonstone
 * stylesheet, which the host page is expected to load.
 */
export const ContentSidePanelProviders = ({language, children}) => {
    const apolloContext = useContext(getApolloContext());
    const reduxContext = useContext(ReactReduxContext);
    const notifications = useNotifications();

    const hasClient = Boolean(apolloContext?.client);
    const hasStore = Boolean(reduxContext?.store);

    const fallbackClient = useMemo(() => (hasClient ? null : createFallbackClient()), [hasClient]);
    const fallbackStore = useMemo(() => (hasStore ? null : createStaticStore({
        uilang: window.contextJsParameters?.uilang || language,
        language: language,
        site: window.contextJsParameters?.siteKey
    })), [hasStore, language]);

    let content = children;

    if (!notifications) {
        content = <NotificationProvider>{content}</NotificationProvider>;
    }

    if (fallbackStore) {
        content = <ReduxProvider store={fallbackStore}>{content}</ReduxProvider>;
    }

    if (fallbackClient) {
        content = <ApolloProvider client={fallbackClient}>{content}</ApolloProvider>;
    }

    return content;
};

ContentSidePanelProviders.propTypes = {
    language: PropTypes.string.isRequired,
    children: PropTypes.node.isRequired
};
