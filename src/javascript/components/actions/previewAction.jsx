import {composeActions} from '@jahia/react-material';
import requirementsAction from './requirementsAction';
import _ from 'lodash';
import {CM_PREVIEW_STATES, cmSetPreviewState} from '../redux/actions';
import {reduxAction} from './reduxAction';

export default composeActions(requirementsAction, reduxAction(state => ({selection: state.selection, previewState: state.previewState}), dispatch => ({setPreviewState: state => dispatch(cmSetPreviewState(state))})), {
    init: context => {
        context.initRequirements({hideOnNodeTypes: ['jnt:page', 'jnt:folder', 'jnt:contentFolder']});
    },
    onClick: context => {
        let {previewState, setPreviewState, selection, force} = context;
        if (force !== undefined) {
            setPreviewState(force);
        } else if (!_.isEmpty(selection)) {
            switch (previewState) {
                case CM_PREVIEW_STATES.SHOW:
                    setPreviewState(CM_PREVIEW_STATES.HIDE);
                    break;
                default: case CM_PREVIEW_STATES.HIDE: {
                    setPreviewState(CM_PREVIEW_STATES.SHOW);
                    break;
                }
            }
        }
    },
    force: CM_PREVIEW_STATES.SHOW
});
