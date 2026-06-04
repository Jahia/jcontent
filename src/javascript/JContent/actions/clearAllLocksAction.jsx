import React from 'react';
import gql from 'graphql-tag';
import {useNodeChecks} from '@jahia/data-helper';
import PropTypes from 'prop-types';
import {useApolloClient} from '@apollo/client';

export const ClearAllLocksActionComponent = ({path, node: prefetchedNode, render: Render, loading: Loading, ...others}) => {
    const client = useApolloClient();
    const skip = prefetchedNode?.operationsSupport?.lock === false;
    const res = useNodeChecks(
        {path},
        {
            skip,
            getLockInfo: true,
            getOperationSupport: true,
            requiredPermission: ['clearLock']
        }
    );

    if (res.loading) {
        return (Loading && <Loading {...others}/>) || false;
    }

    if (skip) {
        return false;
    }

    const isVisible = res.checksResult && res.node && res.node.operationsSupport.lock && res.node.lockTypes !== null && res.node.lockTypes.values.indexOf(' deletion :deletion') === -1;

    return (
        <Render
            {...others}
            isVisible={isVisible}
            enabled={isVisible}
            onClick={() => {
                client.mutate({
                    variables: {pathOrId: path},
                    mutation: gql`mutation clearAllLocks($pathOrId: String!) {
                        jcr {
                            mutateNode(pathOrId: $pathOrId) {
                                clearAllLocks
                            }
                        }
                    }`,
                    refetchQueries: [
                        {
                            query: res.query,
                            variables: res.variables
                        }
                    ]
                });
            }}
        />
    );
};

ClearAllLocksActionComponent.propTypes = {
    path: PropTypes.string,

    node: PropTypes.object,

    render: PropTypes.func.isRequired,

    loading: PropTypes.func
};
