import React, {createContext, useCallback, useContext, useEffect, useMemo, useRef, useState} from 'react';
import PropTypes from 'prop-types';
import {useApolloClient} from '@apollo/client';
import gql from 'graphql-tag';

/**
 * Counting the nodes referencing a category costs a reference lookup per node, which is far too
 * expensive to ask for while loading the tree (it dominated the query: seconds instead of
 * milliseconds on a wide branch). Only the rows the table actually renders are virtualized into
 * the DOM, so instead each visible cell asks for its own count once it is mounted, and those
 * requests are grouped into a single query a moment later.
 */

const UsagesQuery = gql`
    query CategoryUsagesCount($paths: [String!]!) {
        jcr {
            nodesByPath(paths: $paths) {
                path
                usagesCount: referenceCount(typesFilter: {types: ["jnt:workflowTask"], multi: NONE})
            }
        }
    }
`;

// Long enough to collect the cells of one render pass, short enough to feel immediate
const BATCH_DELAY_MS = 80;
// Keeps a fast scroll from building one huge query; leftovers go to the next batch
const MAX_BATCH_SIZE = 50;

const UsagesCountContext = createContext(null);

export const UsagesCountProvider = ({children}) => {
    const client = useApolloClient();
    const [counts, setCounts] = useState({});
    const queued = useRef(new Set());
    const requested = useRef(new Set());
    const timer = useRef(null);

    const flush = useCallback(() => {
        timer.current = null;
        const paths = [...queued.current].slice(0, MAX_BATCH_SIZE);
        if (paths.length === 0) {
            return;
        }

        paths.forEach(path => queued.current.delete(path));

        // With errorPolicy 'all', a path removed in the meantime cannot discard the whole batch
        client.query({query: UsagesQuery, variables: {paths}, fetchPolicy: 'network-only', errorPolicy: 'all'})
            .then(({data}) => {
                const resolved = {};
                (data?.jcr?.nodesByPath || []).forEach(node => {
                    if (node?.path) {
                        resolved[node.path] = node.usagesCount;
                    }
                });

                if (Object.keys(resolved).length > 0) {
                    setCounts(previous => ({...previous, ...resolved}));
                }
            })
            .catch(error => {
                console.warn('Could not read category usages', error);
                // Allow a later render to retry these
                paths.forEach(path => requested.current.delete(path));
            })
            .then(() => {
                if (queued.current.size > 0 && !timer.current) {
                    timer.current = window.setTimeout(flush, BATCH_DELAY_MS);
                }
            });
    }, [client]);

    const request = useCallback(path => {
        if (!path || requested.current.has(path)) {
            return;
        }

        requested.current.add(path);
        queued.current.add(path);
        if (!timer.current) {
            timer.current = window.setTimeout(flush, BATCH_DELAY_MS);
        }
    }, [flush]);

    useEffect(() => () => {
        if (timer.current) {
            window.clearTimeout(timer.current);
        }
    }, []);

    const context = useMemo(() => ({counts, request}), [counts, request]);

    return <UsagesCountContext.Provider value={context}>{children}</UsagesCountContext.Provider>;
};

UsagesCountProvider.propTypes = {
    children: PropTypes.node
};

/**
 * Returns the number of nodes referencing that path, or undefined until it has been fetched.
 */
export const useUsagesCount = path => {
    const context = useContext(UsagesCountContext);
    const request = context?.request;

    useEffect(() => {
        if (request) {
            request(path);
        }
    }, [request, path]);

    return context?.counts[path];
};
