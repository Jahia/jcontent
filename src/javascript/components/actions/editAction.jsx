import {composeActions} from '@jahia/react-material';
import requirementsAction from './requirementsAction';
import {withDxContextAction} from './withDxContextAction';

export default composeActions(requirementsAction, withDxContextAction, {
    init: context => {
        context.initRequirements();
        if (context.dxContext.userName === 'root') {
            context.enabled = true;
        }
    },
    onClick: context => window.parent.authoringApi.editContent(context.node.path, context.node.displayName, ['jnt:content'], [context.primaryNodeType], context.uuid, false)
});
