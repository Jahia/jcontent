import React from 'react';
import gql from 'graphql-tag';
import {useNodeChecks} from '@jahia/data-helper';
import PropTypes from 'prop-types';
import {useApolloClient} from '@apollo/react-hooks';

export const UnlockActionComponent = ({path, render: Render, loading: Loading, ...others}) => {
    const client = useApolloClient();
    const res = useNodeChecks(
        {path},
        {
            getLockInfo: true,
            getOperationSupport: true,
            requiredPermission: 'jcr:lockManagement'
        }
    );

    if (res.loading) {
        return (Loading && <Loading {...others}/>) || false;
    }

    const isVisible = res.checksResult && res.node.operationsSupport.lock && res.node.lockTypes !== null && res.node.lockTypes.values.indexOf(' deletion :deletion') === -1;

    return (
        <Render
            {...others}
            isVisible={isVisible}
            enabled={isVisible}
            onClick={() => {
                client.mutate({
                    variables: {pathOrId: path},
                    mutation: gql`mutation unlockNode($pathOrId: String!) {
                        jcr {
                            mutateNode(pathOrId: $pathOrId) {
                                unlock
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

UnlockActionComponent.propTypes = {
    path: PropTypes.string,

    render: PropTypes.func.isRequired,

    loading: PropTypes.func
};
