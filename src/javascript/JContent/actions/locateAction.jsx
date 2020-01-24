import {composeActions} from '@jahia/react-material';
import requirementsAction from './requirementsAction';
import {cmGoto, cmOpenPaths} from '../JContent.redux-actions';
import {reduxAction} from './reduxAction';
import treeExpanderAction from './treeExpanderAction';
import {of} from 'rxjs';
import * as _ from 'lodash';
import {cmSetPreviewSelection} from '../preview.redux-actions';

export default composeActions(
    requirementsAction,

    reduxAction(state => ({mode: state.mode}), dispatch => ({
        setOpenPaths: state => dispatch(cmOpenPaths(state)),
        setPreviewSelection: state => dispatch(cmSetPreviewSelection(state)),
        navigateToPath: (mode, path, params) => {
            params = _.clone(params);
            _.unset(params, 'searchContentType');
            _.unset(params, 'searchTerms');
            _.unset(params, 'sql2SearchFrom');
            _.unset(params, 'sql2SearchWhere');
            dispatch(cmGoto({mode: mode, path: path, params: params}));
        }
    })),

    treeExpanderAction((mode, ancestorPaths, context) => {
        let {navigateToPath, setOpenPaths, setPreviewSelection, path, params} = context;
        navigateToPath(mode, ancestorPaths[ancestorPaths.length - 1], params);
        setOpenPaths(ancestorPaths);
        setPreviewSelection(path);
    }),

    {
        init: context => {
            context.initRequirements({
                enabled: context => of(context.mode === 'search' || context.mode === 'sql2Search')
            });
        }
    }
);
