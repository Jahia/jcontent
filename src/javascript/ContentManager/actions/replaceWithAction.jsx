import {composeActions} from '@jahia/react-material';
import requirementsAction from './requirementsAction';
import {reduxAction} from './reduxAction';
import {batchActions} from 'redux-batched-actions';
import {setPath} from '../ContentRoute/ContentLayout/Upload/Upload.redux-actions';
import {onFilesSelected} from '../ContentRoute/ContentLayout/Upload/Upload.utils';

const elementName = 'file-replace-input-';

export default composeActions(requirementsAction, reduxAction(null, dispatch => ({dispatchBatch: actions => dispatch(batchActions(actions))})), {

    init: context => {
        context.initRequirements({
        });
        let element = document.getElementById(elementName + context.key);
        if (element !== null) {
            element.remove();
        }
        let input = document.createElement('input');
        input.setAttribute('type', 'file');
        input.setAttribute('id', elementName + context.key);
        document.body.appendChild(input);
        const replaceTarget = context.path;
        setPath(replaceTarget);
        input.addEventListener('change', e => {
            onFilesSelected(
                [...e.target.files],
                context.dispatchBatch,
                {path: replaceTarget},
                context.uploadType
            );
        });
    },

    onClick: context => {
        console.log('open file browser');
        let input = document.getElementById(elementName + context.key);
        input.click();
    }

});
