import {composeActions} from '@jahia/react-material';
import requirementsAction from './requirementsAction';
import {withDxContextAction} from './withDxContextAction';
import {reduxAction} from './reduxAction';

export default composeActions(requirementsAction, withDxContextAction, reduxAction(state => ({previewMode: state.previewMode}), null), {

    init: context => {
        context.initRequirements({});
    },

    onClick: context => {
        let a = document.createElement('a');
        a.setAttribute('title', 'download');
        a.setAttribute('target', '_blank');
        a.setAttribute('href', context.dxContext.contextPath + '/files/' + (context.previewMode === 'edit' ? 'default' : 'live') + context.originalContext.path);
        a.setAttribute('download', context.originalContext.path.split('/').pop());
        a.click();
    }
});
