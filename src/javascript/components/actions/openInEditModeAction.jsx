import {map} from 'rxjs/operators';
import {composeActions} from '@jahia/react-material';
import requirementsAction from './requirementsAction';
import {withDxContextAction} from './withDxContextAction';
import _ from 'lodash';

export default composeActions(requirementsAction, withDxContextAction, {
    init: context => {
        const siteContentPath = '/sites/' + context.dxContext.siteKey + '/contents';
        context.initRequirements({
            getDisplayableNodePath: true,
            requiredPermission: 'editModeAccess',
            enabled: context => {
                return context.node.pipe(map(node => {
                    return !_.isEmpty(node.displayableNode) && node.displayableNode.path.indexOf(siteContentPath) === -1 && node.displayableNode.path.indexOf('/sites/systemsite/') === -1;
                }));
            }
        });
    },
    showOnNodeTypes: ['jnt:page', 'jmix:editorialContent', 'jnt:content'],
    onClick: context => {
        window.open(context.dxContext.contextPath + '/cms/edit/default/' + context.dxContext.lang + context.node.displayableNode.path + '.html', '_blank');
    }
});
