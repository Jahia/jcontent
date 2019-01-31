import CopyPasteNode from './CopyPasteNode';
import {copy} from './actions.redux-actions';
import {composeActions} from '@jahia/react-material';
import {reduxAction} from './reduxAction';
import requirementsAction from './requirementsAction';
import {map} from 'rxjs/operators';
import {hasMixin} from '../ContentManager.utils';

export default composeActions(requirementsAction, reduxAction(() => ({}), dispatch => ({copy: n => dispatch(copy(n))})), {

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
        if (context.node) {
            context.copy([new CopyPasteNode({...context.node, mutationToUse: CopyPasteNode.PASTE_MODES.MOVE})]);
        } else if (context.nodes) {
            context.copy(context.nodes.map(node => new CopyPasteNode({
                ...node,
                mutationToUse: CopyPasteNode.PASTE_MODES.MOVE
            })));
        }
    }
});
