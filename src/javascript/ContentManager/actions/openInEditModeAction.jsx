import {composeActions} from '@jahia/react-material';
import requirementsAction from './requirementsAction';
import {withDxContextAction} from './withDxContextAction';

export default composeActions(requirementsAction, withDxContextAction, {
    init: context => {
        context.initRequirements({
            getDisplayableNodePath: true,
            requiredPermission: 'editModeAccess'
        });
    },
    showOnNodeTypes: ['jnt:page', 'jmix:editorialContent', 'jnt:content'],
    onClick: context => {
        window.open(context.dxContext.contextPath + '/cms/edit/default/' + context.language + context.node.displayableNode.path + '.html', '_blank');
    }
});
