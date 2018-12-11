import {composeActions} from '@jahia/react-material';
import requirementsAction from './requirementsAction';
import {CM_DRAWER_STATES, cmSetPreviewState} from '../redux/actions';
import {reduxAction} from './reduxAction';

export default composeActions(requirementsAction, reduxAction(() => ({}), dispatch => ({setPreviewState: state => dispatch(cmSetPreviewState(state))})), {
    init: context => {
        context.initRequirements({hideOnNodeTypes: ['jnt:page', 'jnt:folder', 'jnt:contentFolder']});
    },
    onClick: context => {
        let {setPreviewState} = context;
        setPreviewState(CM_DRAWER_STATES.SHOW);
    }
});
