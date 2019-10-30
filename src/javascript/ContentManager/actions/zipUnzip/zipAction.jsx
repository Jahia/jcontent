import React from 'react';
import {componentRendererAction, composeActions, ProgressOverlay} from '@jahia/react-material';
import requirementsAction from '../requirementsAction';
import {withNotificationContextAction} from '../withNotificationContextAction';
import {refetchContentTreeAndListData} from '../../ContentManager.refetches';
import zipUnzipQueries from './zipUnzip.gql-queries';
import zipUnzipMutation from './zipUnzip.gql-mutations';
import {getNewCounter, removeFileExtension} from '../../ContentManager.utils';
import {reduxAction} from '../reduxAction';
import {cmClearSelection} from '../../ContentRoute/ContentLayout/contentSelection.redux-actions';

export default composeActions(requirementsAction, withNotificationContextAction, componentRendererAction,
    reduxAction(() => ({}), dispatch => ({
        clearSelection: () => dispatch(cmClearSelection())
    })), {
        init: context => {
            context.initRequirements({
                requiredPermission: 'jcr:addChildNodes'
            });
        },
        onClick: context => {
            let name = context.node ? context.node.name : (context.nodes.length > 1 ? context.nodes[0].parent.name : context.nodes[0].name);
            let nameWithoutExtension = removeFileExtension(name);
            let paths = context.node ? [context.node.path] : context.paths;
            let uuid = context.node ? context.node.uuid : context.nodes[0].uuid;
            let parentPath = context.node ? context.node.parent.path : context.nodes[0].parent.path;

            // Query to have zip files in the same directory with the same name to add a counter
            let siblings = context.client.query({
                query: zipUnzipQueries.siblingsWithSameNameQuery,
                variables: {uuid: uuid, name: nameWithoutExtension, extension: '.zip'},
                fetchPolicy: 'network-only'
            });

            let newName = '';
            siblings.then(function (res) {
                if (res.data && res.data.jcr && res.data.jcr.nodeById.parent.filteredSubNodes.nodes.length > 0) {
                    let siblings = res.data.jcr.nodeById.parent.filteredSubNodes.nodes;
                    newName = nameWithoutExtension.concat(getNewCounter(siblings) + '.zip');
                } else {
                    newName = removeFileExtension(name).concat('.zip');
                }

                let handler = context.renderComponent(<ProgressOverlay/>);
                // Zip mutation after calculating the new name of zip file
                context.client.mutate({
                    variables: {parentPathOrId: parentPath, name: newName, paths: paths},
                    mutation: zipUnzipMutation.zip,
                    refetchQueries: [{
                        query: zipUnzipQueries.siblingsWithSameNameQuery,
                        variables: {uuid: uuid, name: nameWithoutExtension, extension: '.zip'}
                    }]
                }).then(() => {
                    context.clearSelection();
                    refetchContentTreeAndListData();
                    handler.destroy();
                }).catch((reason => {
                    handler.destroy();
                    context.notificationContext.notify(reason.toString(), ['closeButton', 'noAutomaticClose']);
                }));
            });
        }
    });
