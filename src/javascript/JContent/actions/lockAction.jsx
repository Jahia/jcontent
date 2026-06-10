import React from 'react';
import gql from 'graphql-tag';
import {useNodeChecks} from '@jahia/data-helper';
import PropTypes from 'prop-types';
import {useApolloClient} from '@apollo/client';
import {isDefinitelyHidden} from './utils/nodeVisibilityUtils';
export const LockActionComponent = ({path, node: prefetchedNode, render: Render, loading: Loading, ...others}) => {
    const client = useApolloClient();
    const hideOnNodeTypes = ['jnt:navMenuText', 'jnt:category'];
    const skip = isDefinitelyHidden(prefetchedNode, {hideOnNodeTypes}) ||
        prefetchedNode?.operationsSupport?.lock === false;
    const res = useNodeChecks(
        {path},
        {
            skip,
            getLockInfo: true,
            getCanLockUnlock: true,
            getOperationSupport: true,
            requiredPermission: 'jcr:lockManagement',
            hideOnNodeTypes,
            getPermissions: ['lockPageAction']
        }
    );

    if (res.loading) {
        return (Loading && <Loading {...others}/>) || false;
    }

    if (skip) {
        return false;
    }

    const isVisible = res.checksResult && res.node &&
        res.node.operationsSupport.lock &&
        res.node.lockTypes === null &&
        (!res.node['jnt:page'] || res.node.lockPageAction) &&
        res.node.lockInfo && res.node.lockInfo.canLock;

    return (
        <Render
            {...others}
            isVisible={isVisible}
            enabled={isVisible}
            onClick={() => {
                client.mutate({
                    variables: {pathOrId: path},
                    mutation: gql`mutation lockNode($pathOrId: String!) {
                        jcr {
                            mutateNode(pathOrId: $pathOrId) {
                                lock
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

LockActionComponent.propTypes = {
    path: PropTypes.string,

    node: PropTypes.object,

    render: PropTypes.func.isRequired,

    loading: PropTypes.func
};
