import {composeActions} from '@jahia/react-material';
import requirementsAction from './requirementsAction';

export default composeActions(requirementsAction, {
    init: context => context.initRequirements(),
    onClick: context => window.parent.authoringApi.editContent(context.node.path, context.node.displayName, ['jnt:content'], [context.primaryNodeType], context.uuid, false)
});
