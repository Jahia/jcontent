import React from 'react';
import {lockNode, unlockNode} from "../preview/gqlMutations";
import { Mutation } from 'react-apollo';

class LockManagementAction extends React.Component {
    render() {
        const {action, context} = this.props;
        switch (action) {
            case 'lock':
                //Only render this component if there is no lock on it
                return _.isEmpty(context.retrieveProperties) ? this.lock() : null;
            case 'unlock':
                //Only render this component if the node has a lock on it.
                return context.retrieveProperties != null && _.find(context.retrieveProperties, (obj)=> {
                    return obj.name === 'j:lockTypes';
                }) !== undefined ? this.unlock() : null;
        }
    }

    lock = () => {
        const {target:menuId, children, context, layoutQuery, layoutQueryParams, ...rest} = this.props;
        return <Mutation
            mutation={ lockNode }
            refetchQueries={[{
                query: context.requirementQueryHandler.getQuery(),
                variables: context.requirementQueryHandler.getVariables()
            }]}>
            {(lockNode) => {
                return children({
                    ...rest,
                    menuId,
                    onClick: () => lockNode({variables: {pathOrId: context.path}})
                });
            }}
        </Mutation>
    };

    unlock = () => {
        const {target:menuId, children, context, close, ...rest} = this.props;
        return <Mutation
            mutation={ unlockNode }
            refetchQueries={[{
                query: context.requirementQueryHandler.getQuery(),
                variables: context.requirementQueryHandler.getVariables()
            }]}>
            {(unlockNode) => {
                return children({
                    ...rest,
                    menuId,
                    onClick: () => {unlockNode({variables: {pathOrId: context.path}})}
                });
            }}
        </Mutation>
    };
}

export default LockManagementAction;