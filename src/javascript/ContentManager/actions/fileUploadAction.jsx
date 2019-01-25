import {batchActions} from 'redux-batched-actions';
import {composeActions} from '@jahia/react-material';
import requirementsAction from './requirementsAction';
import {reduxAction} from './reduxAction';
import {onFilesSelected} from '../ContentLayout/Upload/Upload.utils';
import {setPath} from '../ContentLayout/Upload/Upload.redux-actions';

export default composeActions(requirementsAction, reduxAction(null, dispatch => ({dispatchBatch: actions => dispatch(batchActions(actions))})), {
    init: context => {
        context.initRequirements({
            requiredPermission: 'jcr:addChildNodes',
            showOnNodeTypes: ['jnt:folder']
        });
    },

    onClick: context => {
        let input = document.createElement('input');
        let files = [];
        input.setAttribute('type', 'file');
        input.setAttribute('multiple', 'true');
        input.click();
        input.addEventListener('change', () => {
            Array.from(input.files).forEach(file => {
                files.push(file);
            });
            setPath(context.path);
            onFilesSelected(
                files,
                context.dispatchBatch,
                {path: context.path}
            );
        });
    }
});
