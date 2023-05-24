import React from 'react';
import gql from 'graphql-tag';
import {useNodeChecks} from '@jahia/data-helper';
import PropTypes from 'prop-types';
import {useApolloClient} from '@apollo/client';

export const LockActionComponent = ({path, render: Render, loading: Loading, ...others}) => {
    const client = useApolloClient();
    const res = useNodeChecks(
        {path},
        {
            getLockInfo: true,
            getOperationSupport: true,
            requiredPermission: 'jcr:lockManagement',
            hideOnNodeTypes: ['jnt:navMenuText']
        }
    );

    if (res.loading) {
        return (Loading && <Loading {...others}/>) || false;
    }

    const isVisible = res.checksResult && res.node.operationsSupport.lock && res.node.lockTypes === null;

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

    render: PropTypes.func.isRequired,

    loading: PropTypes.func
};
