import {ellipsizeText, hasMixin} from '../ContentManager.utils';
import {map} from 'rxjs/operators';
import {composeActions} from '@jahia/react-material';
import requirementsAction from './requirementsAction';

export default composeActions(requirementsAction, {
    init: context => {
        context.initRequirements({
            retrieveProperties: {retrievePropertiesNames: ['jcr:mixinTypes']},
            retrieveDisplayName: true,
            requiredPermission: 'jcr:removeNode',
            enabled: context => context.node.pipe(map(node => hasMixin(node, 'jmix:markedForDeletionRoot')))
        });
    },
    onClick: context => {
        if (context.node) {
            window.authoringApi.undeleteContent(context.node.uuid, context.node.path, (context.node.displayName ? ellipsizeText(context.displayName, 100) : ''), context.node.name);
        } else if (context.nodes) {
            window.authoringApi.undeleteContents(context.nodes.map(node => ({uuid: node.uuid, path: node.path, displayName: node.displayName, nodeTypes: ['jnt:content'], inheritedNodeTypes: ['nt:base']})));
        }
    }
});
