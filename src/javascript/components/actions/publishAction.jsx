import {composeActions} from '@jahia/react-material';
import {isMarkedForDeletion} from '../utils';
import requirementsAction from './requirementsAction';
import {withNodeName} from './withNodeName';
import {map} from 'rxjs/operators';

export default composeActions(requirementsAction, withNodeName, {
    init: context => {
        context.initRequirements({
            retrieveProperties: {retrievePropertiesNames: ['jcr:mixinTypes']},
            retrieveSiteLanguages: true,
            enabled: context => context.node.pipe(map(node =>
                (context.checkForUnpublication ?
                    node.aggregatedPublicationInfo.publicationStatus !== 'NOT_PUBLISHED' :
                    !isMarkedForDeletion(node)) &&
                (!context.checkIfLanguagesMoreThanOne || node.site.languages.length > 1)))
        });
        context.initLabelParams(context);
    },
    onClick: context => window.parent.authoringApi.openPublicationWorkflow([context.node.uuid], context.allSubTree, context.allLanguages, context.checkForUnpublication)
});
