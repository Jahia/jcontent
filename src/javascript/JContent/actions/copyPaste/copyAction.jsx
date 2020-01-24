import {copy} from './copyPaste.redux-actions';
import {composeActions} from '@jahia/react-material';
import {reduxAction} from '../reduxAction';
import requirementsAction from '../requirementsAction';
import {map} from 'rxjs/operators';
import {hasMixin} from '../../JContent.utils';
import copyPasteConstants from './copyPaste.constants';
import {setLocalStorage} from './localStorageHandler';

export default composeActions(requirementsAction, reduxAction(() => ({}), dispatch => ({copy: n => dispatch(copy(n))})), {

    init: context => {
        context.initRequirements({
            retrievePrimaryNodeType: true,
            retrieveDisplayName: true,
            retrieveProperties: {retrievePropertiesNames: ['jcr:mixinTypes']},
            enabled: context => context.node.pipe(map(node => !hasMixin(node, 'jmix:markedForDeletionRoot')))
        });
    },

    onClick: context => {
        let nodes = context.node ? [context.node] : context.nodes;
        setLocalStorage(copyPasteConstants.COPY, nodes, context.client);
        context.copy(nodes);
    }
});
