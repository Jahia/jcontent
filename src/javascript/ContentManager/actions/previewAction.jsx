import {composeActions} from '@jahia/react-material';
import requirementsAction from './requirementsAction';
import {CM_DRAWER_STATES, cmSetPreviewState, cmSetPreviewSelection} from '../ContentManager.redux-actions';
import {reduxAction} from './reduxAction';

export default composeActions(requirementsAction, reduxAction(() => ({}), dispatch => ({
    setPreviewState: state => dispatch(cmSetPreviewState(state)),
    setPreviewSelection: previewSelection => dispatch(cmSetPreviewSelection(previewSelection))
})), {
    init: context => {
        context.initRequirements({hideOnNodeTypes: ['jnt:page', 'jnt:folder', 'jnt:contentFolder']});
    },
    onClick: context => {
        let {setPreviewState, setPreviewSelection} = context;
        setPreviewSelection(context.path);
        setPreviewState(CM_DRAWER_STATES.SHOW);
    }
});
