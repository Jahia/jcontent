import {composeActions} from '@jahia/react-material';
import requirementsAction from './requirementsAction';
import {CM_DRAWER_STATES, cmSetPreviewState, cmSetSelection} from '../redux/actions';
import {reduxAction} from './reduxAction';

export default composeActions(requirementsAction, reduxAction(() => ({}), dispatch => ({setPreviewState: state => dispatch(cmSetPreviewState(state)), setSelection: selection => dispatch(cmSetSelection(selection))})), {
    init: context => {
        context.initRequirements({hideOnNodeTypes: ['jnt:page', 'jnt:folder', 'jnt:contentFolder']});
    },
    onClick: context => {
        let {setPreviewState, setSelection} = context;
        setSelection(context.path);
        setPreviewState(CM_DRAWER_STATES.SHOW);
    }
});
