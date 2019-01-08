import {setPanelState, setPath} from '../Upload/Upload.redux-actions';
import {panelStates} from '../Upload/Upload.constants';
import {batchActions} from 'redux-batched-actions';
import {composeActions} from '@jahia/react-material';
import requirementsAction from './requirementsAction';
import {reduxAction} from './reduxAction';

export default composeActions(requirementsAction, reduxAction(null, dispatch => ({dispatchBatch: actions => dispatch(batchActions(actions))})), {
    init: context => {
        context.initRequirements({
            requiredPermission: 'jcr:addChildNodes',
            showOnNodeTypes: ['jnt:folder']
        });
    },

    onClick: context => {
        context.dispatchBatch([
            setPath(context.path),
            setPanelState(panelStates.VISIBLE)
        ]);
    }

});
