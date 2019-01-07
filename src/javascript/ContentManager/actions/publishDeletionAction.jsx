import {hasMixin} from '../ContentManager.utils';
import {map} from 'rxjs/operators';
import {composeActions} from '@jahia/react-material';
import requirementsAction from './requirementsAction';

export default composeActions(requirementsAction, {
    init: context => {
        context.initRequirements({
            retrieveProperties: {retrievePropertiesNames: ['jcr:mixinTypes']},
            enabled: context => context.node.pipe(map(node => hasMixin(node, 'jmix:markedForDeletionRoot')))
        });
    },
    onClick: context => window.parent.authoringApi.openPublicationWorkflow([context.node.uuid], true, false, false)
});
