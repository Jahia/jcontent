import {ellipsizeText, hasMixin} from '../utils.js';
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
    onClick: context => window.parent.authoringApi.undeleteContent(context.node.uuid, context.node.path, (context.node.displayName ? ellipsizeText(context.displayName, 100) : ''), context.node.name)
});
