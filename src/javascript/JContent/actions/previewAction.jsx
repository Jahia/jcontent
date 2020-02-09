import {composeActions} from '@jahia/react-material';
import requirementsAction from './requirementsAction';
import {CM_DRAWER_STATES} from '../JContent.redux';
import {reduxAction} from './reduxAction';
import {cmSetPreviewSelection, cmSetPreviewState} from '../preview.redux';

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
