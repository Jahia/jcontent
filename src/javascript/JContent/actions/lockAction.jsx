import React from 'react';
import gql from 'graphql-tag';
import {useNodeChecks} from '@jahia/data-helper';
import PropTypes from 'prop-types';
import {useApolloClient} from '@apollo/react-hooks';

export const LockActionComponent = ({context, render: Render, loading: Loading}) => {
    const client = useApolloClient();
    const res = useNodeChecks(
        {path: context.path},
        {
            getLockInfo: true,
            getOperationSupport: true,
            requiredPermission: 'jcr:lockManagement',
            ...context
        }
    );

    if (res.loading) {
        return (Loading && <Loading context={context}/>) || false;
    }

    const isVisible = res.checksResult && res.node.operationsSupport.lock && res.node.lockTypes === null;

    return (
        <Render context={{
            ...context,
            isVisible: isVisible,
            enabled: isVisible,
            onClick: () => {
                client.mutate({
                    variables: {pathOrId: context.path},
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
            }
        }}/>
    );
};

LockActionComponent.propTypes = {
    context: PropTypes.object.isRequired,

    render: PropTypes.func.isRequired,

    loading: PropTypes.func
};
