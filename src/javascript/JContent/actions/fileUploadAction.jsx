import {batchActions} from 'redux-batched-actions';
import {composeActions} from '@jahia/react-material';
import requirementsAction from './requirementsAction';
import {reduxAction} from './reduxAction';
import {onFilesSelected} from '../ContentRoute/ContentLayout/Upload/Upload.utils';
import {fileuploadSetPath} from '../ContentRoute/ContentLayout/Upload/Upload.redux-actions';

export default composeActions(requirementsAction, reduxAction(null, dispatch => ({dispatchBatch: actions => dispatch(batchActions(actions))})), {
    init: context => {
        context.initRequirements({
        });
        let element = document.getElementById('file-upload-input-' + context.key);
        if (element !== null) {
            element.setAttribute('context-path', context.path);
            element.value = null;
            return;
        }

        let input = document.createElement('input');
        input.setAttribute('type', 'file');
        if (context.uploadType !== 'replaceWith') {
            input.setAttribute('multiple', 'true');
        }

        input.setAttribute('id', 'file-upload-input-' + context.key);
        input.setAttribute('context-path', context.path);
        document.body.appendChild(input);
        input.addEventListener('change', e => {
            const path = input.getAttribute('context-path');
            fileuploadSetPath(path);
            onFilesSelected(
                [...e.target.files],
                context.dispatchBatch,
                {path},
                context.uploadType
            );
        });
    },

    onClick: context => {
        let input = document.getElementById('file-upload-input-' + context.key);
        input.click();
    }
});
