import React from 'react';
import gql from 'graphql-tag';
import * as _ from 'lodash';
import {useNodeChecks} from '@jahia/data-helper';
import PropTypes from 'prop-types';
import {useApolloClient} from '@apollo/react-hooks';

export const ClearAllLockActionComponent = ({context, render: Render, loading: Loading}) => {
    const client = useApolloClient();
    const res = useNodeChecks(
        {path: context.path},
        {
            getLockInfo: true,
            requiredPermission: ['clearLock'],
            ...context
        }
    );

    if (res.loading && Loading) {
        return <Loading context={context}/>;
    }

    if (!res.node) {
        return false;
    }

    const isVisible = res.checksResult && res.node.lockTypes !== null && !_.includes(res.node.lockTypes.values, ' deletion :deletion');

    return (
        <Render context={{
            ...context,
            isVisible: isVisible,
            enabled: isVisible,
            onClick: () => {
                client.mutate({
                    variables: {pathOrId: context.path},
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
            }
        }}/>
    );
};

ClearAllLockActionComponent.propTypes = {
    context: PropTypes.object.isRequired,

    render: PropTypes.func.isRequired,

    loading: PropTypes.func
};

const clearAllLocksAction = {
    component: ClearAllLockActionComponent
};

export default clearAllLocksAction;
