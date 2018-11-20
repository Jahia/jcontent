import {isMarkedForDeletion} from '../utils';
import {map} from 'rxjs/operators';
import {composeActions} from '@jahia/react-material';
import requirementsAction from './requirementsAction';

export default composeActions(requirementsAction, {
    init: context => {
        context.initRequirements({
            retrieveProperties: {retrievePropertiesNames: ['jcr:mixinTypes']},
            requiredPermission: 'jcr:removeNode',
            enabled: context => context.node.pipe(map(node => !isMarkedForDeletion(node)))
        });
    },
    onClick: context => window.parent.authoringApi.deleteContent(context.uuid, context.node.path, context.node.displayName, ['jnt:content'], ['nt:base'], false, false)
});
