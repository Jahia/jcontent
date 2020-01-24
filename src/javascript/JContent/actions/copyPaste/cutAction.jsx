import {cut} from './copyPaste.redux-actions';
import {composeActions} from '@jahia/react-material';
import {reduxAction} from '../reduxAction';
import requirementsAction from '../requirementsAction';
import {map} from 'rxjs/operators';
import {hasMixin} from '../../JContent.utils';
import {setLocalStorage} from './localStorageHandler';
import copyPasteConstants from './copyPaste.constants';

export default composeActions(requirementsAction, reduxAction(() => ({}), dispatch => ({cut: n => dispatch(cut(n))})), {

    init: context => {
        context.initRequirements({
            retrievePrimaryNodeType: true,
            retrieveDisplayName: true,
            requiredPermission: 'jcr:removeNode',
            retrieveProperties: {retrievePropertiesNames: ['jcr:mixinTypes']},
            enabled: context => context.node.pipe(map(node => !hasMixin(node, 'jmix:markedForDeletionRoot')))
        });
    },

    onClick: context => {
        let nodes = context.node ? [context.node] : context.nodes;
        setLocalStorage(copyPasteConstants.CUT, nodes, context.client);
        context.cut(nodes);
    }
});
