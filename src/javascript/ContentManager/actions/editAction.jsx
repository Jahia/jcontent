import {composeActions} from '@jahia/react-material';
import requirementsAction from './requirementsAction';
import {withDxContextAction} from './withDxContextAction';

export default composeActions(requirementsAction, withDxContextAction, {
    init: context => {
        context.initRequirements({retrieveDisplayName: true, retrievePrimaryNodeType: true});
        if (context.dxContext.userName === 'root') {
            context.enabled = true;
        }
    },
    onClick: context => window.authoringApi.editContent(context.node.path, context.node.displayName, ['jnt:content'], [context.node.primaryNodeType.name], context.node.uuid, false)
});
