import React from 'react';
import {lockNode, unlockNode, clearAllLocks} from "../preview/gqlMutations";
import { Mutation } from 'react-apollo';
import {composeActions} from "@jahia/react-material";
import requirementsAction from "./requirementsAction";

// class LockManagementAction extends React.Component {
//     render() {
//         const {action, context} = this.props;
//         switch (action) {
//             case 'lock':
//                 //Only render this component if there is no lock on it
//                 return _.isEmpty(context.node.properties) ? this.lock() : null;
//             case 'unlock':
//                 //Only render this component if the node has a lock on it.
//                 return this.isNodeLocked() ? this.unlock() : null;
//             case 'clearAllLocks':
//                 //If user is root
//                 //@TODO update is user root check once current user is implemented in GraphQL DXM Provider
//                 return context.user === 'root' ? this.clearAllLocks() : null
//         }
//     }
//
//     lock = () => {
//         const {children, context, layoutQuery, layoutQueryParams, ...rest} = this.props;
//         return <Mutation
//             mutation={ lockNode }
//             refetchQueries={[{
//                 query: context.requirementQueryHandler.getQuery(),
//                 variables: context.requirementQueryHandler.getVariables()
//             }]}>
//             {(lockNode) => {
//                 return children({
//                     ...rest,
//                     onClick: () => lockNode({variables: {pathOrId: context.path}})
//                 });
//             }}
//         </Mutation>
//     };
//
//     unlock = () => {
//         const {children, context, close, ...rest} = this.props;
//         return <Mutation
//             mutation={ unlockNode }
//             refetchQueries={[{
//                 query: context.requirementQueryHandler.getQuery(),
//                 variables: context.requirementQueryHandler.getVariables()
//             }]}>
//             {(unlockNode) => {
//                 return children({
//                     ...rest,
//                     onClick: () => {unlockNode({variables: {pathOrId: context.path}})}
//                 });
//             }}
//         </Mutation>
//     };
//
//     clearAllLocks = () => {
//         const {children, context, close, ...rest} = this.props;
//         return <Mutation
//             mutation={ clearAllLocks }
//             refetchQueries={[{
//                 query: context.requirementQueryHandler.getQuery(),
//                 variables: context.requirementQueryHandler.getVariables()
//             }]}>
//             {(clearAllLocks) => {
//                 return children({
//                     ...rest,
//                     onClick: () => {clearAllLocks({variables: {pathOrId: context.path}})}
//                 });
//             }}
//         </Mutation>
//     };
//
//     isNodeLocked = () => {
//         let {context} = this.props;
//         return context.node.properties != null && _.find(context.node.properties, (obj)=> {
//             return obj.name === 'j:lockTypes';
//         }) !== undefined
//     };
// }

export default composeActions(requirementsAction, {
  onClick:(context) => {}
});
