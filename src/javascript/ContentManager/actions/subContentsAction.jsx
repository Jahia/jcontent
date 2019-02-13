import {composeActions} from '@jahia/react-material';
import {map} from 'rxjs/operators';
import requirementsAction from './requirementsAction';
import {reduxAction} from './reduxAction';
import treeExpanderAction from './treeExpanderAction';
import * as _ from 'lodash';
import {cmGoto, cmOpenPaths} from '../ContentManager.redux-actions';
import {cmSetPreviewSelection} from '../preview.redux-actions';

export default composeActions(
    requirementsAction,

    reduxAction(null, dispatch => ({
        setOpenPaths: state => dispatch(cmOpenPaths(state)),
        setPreviewSelection: state => dispatch(cmSetPreviewSelection(state)),
        navigateToPath: (mode, path, params) => {
            params = params ? _.clone(params) : {sub: true};
            _.unset(params, 'searchContentType');
            _.unset(params, 'searchTerms');
            _.unset(params, 'sql2SearchFrom');
            _.unset(params, 'sql2SearchWhere');
            dispatch(cmGoto({mode: mode, path: path, params: params}));
        }
    })),

    treeExpanderAction((mode, ancestorPaths, context) => {
        let {navigateToPath, setOpenPaths, setPreviewSelection, path, params} = context;
        navigateToPath(mode, path, params);
        setOpenPaths(ancestorPaths);
        setPreviewSelection(null);
    }),

    {
        init: context => {
            context.initRequirements({
                hideOnNodeTypes: ['jnt:page', 'jnt:file'],
                retrieveSubNodes: true,
                retrievePrimaryNodeType: true,
                enabled: context => context.node.pipe(map(node => node.subNodes.pageInfo.totalCount > 0))
            });
            context.urlParams = {sub: true};
        }
    }
);
