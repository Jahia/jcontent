import {hasMixin} from '../JContent.utils';
import {map} from 'rxjs/operators';
import {composeActions} from '@jahia/react-material';
import requirementsAction from './requirementsAction';

export default composeActions(requirementsAction, {
    init: context => {
        context.initRequirements({
            retrieveProperties: {retrievePropertiesNames: ['jcr:mixinTypes']},
            enabled: context => context.node.pipe(map(node => hasMixin(node, 'jmix:markedForDeletionRoot') && node.aggregatedPublicationInfo.publicationStatus !== 'NOT_PUBLISHED'))
        });
    },
    onClick: context => {
        if (context.node) {
            window.authoringApi.openPublicationWorkflow([context.node.uuid], true, false, false);
        } else if (context.nodes) {
            window.authoringApi.openPublicationWorkflow(context.nodes.map(node => node.uuid), true, false, false);
        }
    }
});
