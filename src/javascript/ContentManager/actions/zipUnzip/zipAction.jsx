import {composeActions} from '@jahia/react-material';
import requirementsAction from '../requirementsAction';
import {withNotificationContextAction} from '../withNotificationContextAction';
import {refetchContentTreeAndListData} from '../../ContentManager.refetches';
import gql from 'graphql-tag';
import {getZipName} from '../../ContentManager.utils';

export default composeActions(requirementsAction, withNotificationContextAction, {
    init: context => context.initRequirements({}),

    onClick: context => {
        let name = context.node ? getZipName(context.node.name) : getZipName(context.nodes[0].parent.name);
        let paths = context.node ? [context.node.path] : context.paths;
        let parentPath = context.node ? context.node.parent.path : context.nodes[0].parent.path;
        context.client.mutate({
            variables: {parentPathOrId: parentPath, name: name, paths: paths},
            mutation: gql`mutation zipFile($parentPathOrId: String!, $name: String!, $paths: [String!]!) {
                            jcr {
                                addNode(parentPathOrId: $parentPathOrId, name: $name, primaryNodeType:"jnt:file") {
                                    zip {
                                        addToZip(pathsOrIds: $paths)
                                    }
                                }
                            }
                        }`
        }).catch((reason => context.notificationContext.notify(reason.toString(), ['closeButton', 'noAutomaticClose'])));
        refetchContentTreeAndListData();
    }
});
