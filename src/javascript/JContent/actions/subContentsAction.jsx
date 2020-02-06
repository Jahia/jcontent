import {composeActions} from '@jahia/react-material';
import {map} from 'rxjs/operators';
import requirementsAction from './requirementsAction';
import {reduxAction} from './reduxAction';
import treeExpanderAction from './treeExpanderAction';
import * as _ from 'lodash';
import {cmGoto, cmOpenPaths} from '../JContent.redux-actions';
import {cmSetPreviewSelection} from '../preview.redux-actions';
import JContentConstants from '../JContent.constants';

export default composeActions(
    requirementsAction,

    reduxAction(state => ({mode: state.mode}), dispatch => ({
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
        let {node, navigateToPath, setOpenPaths, setPreviewSelection, path} = context;
        navigateToPath(mode, path, {sub: node.primaryNodeType.name !== 'jnt:page' && node.primaryNodeType.name !== 'jnt:contentFolder'});
        setOpenPaths(ancestorPaths);
        setPreviewSelection(null);
    }),

    {
        init: context => {
            context.initRequirements({
                retrieveSubNodes: true,
                retrievePrimaryNodeType: true,
                enabled: context => context.node.pipe(map(node => ((node.primaryNodeType.name === 'jnt:page' || node.primaryNodeType.name === 'jnt:folder' || node.primaryNodeType.name === 'jnt:contentFolder') ||
                    (node.subNodes.pageInfo.totalCount > 0)) &&
                    context.mode !== JContentConstants.mode.SEARCH && context.mode !== JContentConstants.mode.SQL2SEARCH))
            });
        }
    }
);
