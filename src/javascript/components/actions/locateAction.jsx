import {composeActions} from '@jahia/react-material';
import requirementsAction from './requirementsAction';
import {cmGoto, cmOpenPaths, cmSetSelection} from '../redux/actions';
import {reduxAction} from './reduxAction';
import Constants from '../constants';
import {of} from 'rxjs';
import * as _ from 'lodash';
import {FindParentQuery} from '../gqlQueries';

export default composeActions(requirementsAction, reduxAction(state => ({mode: state.mode, params: state.params}), dispatch => ({
    setOpenPaths: state => dispatch(cmOpenPaths(state)),
    setSelection: state => dispatch(cmSetSelection(state)),
    navigateToPath: (mode, path, params) => {
        params = _.clone(params);
        _.unset(params, 'searchContentType');
        _.unset(params, 'searchTerms');
        _.unset(params, 'sql2SearchFrom');
        _.unset(params, 'sql2SearchWhere');
        dispatch(cmGoto({mode: mode, path:path, params: params}));
    }
})), {
    init: context => {
        context.initRequirements({
            enabled: context => of(context.mode === 'search' || context.mode === 'sql2Search')
        });
    },
    onClick: context => {
        context.client.watchQuery({query: FindParentQuery, variables: {path: context.path}}).subscribe(res => {
            let n = res.data.jcr.nodeByPath;
            if (!_.isEmpty(n.parents)) {
                let parent = n.parents[n.parents.length - 1];
                let paths = [];
                _.each(n.parents, parent => {
                    paths.push(parent.path);
                });
                let locate = {
                    node: n,
                    paths: paths,
                    navigateToPath: parent.path,
                    type: parent.type.value
                };
                let {navigateToPath, setOpenPaths, setSelection} = context;
                let mode;
                switch (locate.type) {
                    case 'jnt:contentFolder':
                        mode = Constants.mode.BROWSE;
                        break;
                    case 'jnt:folder':
                        mode = Constants.mode.FILES;
                        break;
                    default: {
                        let base = locate.paths[0].split('/');
                        base.pop();
                        locate.paths.splice(0, 0, base.join('/'));
                        mode = Constants.mode.BROWSE;
                    }
                }
                navigateToPath(mode, locate.navigateToPath, context.params);
                setOpenPaths(locate.paths);
                setSelection([locate.node]);
            }
        });
    }
});
