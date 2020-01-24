import {isMarkedForDeletion} from '../JContent.utils';
import {map} from 'rxjs/operators';
import {composeActions} from '@jahia/react-material';
import requirementsAction from './requirementsAction';

export default composeActions(requirementsAction, {
    init: context => {
        context.initRequirements({
            retrieveProperties: {retrievePropertiesNames: ['jcr:mixinTypes']},
            retrieveDisplayName: true,
            requiredPermission: 'jcr:removeNode',
            enabled: context => context.node.pipe(map(node => node.operationsSupport.markForDeletion && !isMarkedForDeletion(node)))
        });
    },
    onClick: context => {
        if (context.node) {
            window.authoringApi.deleteContent(context.node.uuid, context.node.path, context.node.displayName, ['jnt:content'], ['nt:base'], false, false);
        } else if (context.nodes) {
            window.authoringApi.deleteContents(context.nodes.map(node => ({uuid: node.uuid, path: node.path, displayName: node.displayName, nodeTypes: ['jnt:content'], inheritedNodeTypes: ['nt:base']})), false, false);
        }
    }
});
