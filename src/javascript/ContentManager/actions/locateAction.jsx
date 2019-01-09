import {composeActions} from '@jahia/react-material';
import requirementsAction from './requirementsAction';
import {cmGoto, cmOpenPaths, cmSetSelection} from '../redux/actions';
import {reduxAction} from './reduxAction';
import ContentManagerConstants from '../ContentManager.constants';
import {of} from 'rxjs';
import * as _ from 'lodash';
import gql from 'graphql-tag';
import {PredefinedFragments} from '@jahia/apollo-dx';

const FindParentQuery = gql`
    query findParentQuery($path:String!) {
        jcr {
            nodeByPath(path:$path) {
                parents:ancestors(fieldFilter: {filters: {fieldName: "type.value", evaluation: AMONG, values:["jnt:page", "jnt:folder", "jnt:contentFolder"]}}) {
                    type:property(name: "jcr:primaryType") {
                        value
                    }
                    name
                    path
                    ...NodeCacheRequiredFields
                }
                ...NodeCacheRequiredFields
            }
        }
    }
    ${PredefinedFragments.nodeCacheRequiredFields.gql}
`;

export default composeActions(requirementsAction, reduxAction(state => ({mode: state.mode, params: state.params}), dispatch => ({
    setOpenPaths: state => dispatch(cmOpenPaths(state)),
    setSelection: state => dispatch(cmSetSelection(state)),
    navigateToPath: (mode, path, params) => {
        params = _.clone(params);
        _.unset(params, 'searchContentType');
        _.unset(params, 'searchTerms');
        _.unset(params, 'sql2SearchFrom');
        _.unset(params, 'sql2SearchWhere');
        dispatch(cmGoto({mode: mode, path: path, params: params}));
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
                let {navigateToPath, setOpenPaths, setSelection} = context;
                let mode;
                switch (parent.type.value) {
                    case 'jnt:contentFolder':
                        mode = ContentManagerConstants.mode.BROWSE;
                        break;
                    case 'jnt:folder':
                        mode = ContentManagerConstants.mode.FILES;
                        break;
                    default: {
                        let base = paths[0].split('/');
                        base.pop();
                        paths.splice(0, 0, base.join('/'));
                        mode = ContentManagerConstants.mode.BROWSE;
                    }
                }
                navigateToPath(mode, parent.path, context.params);
                setOpenPaths(paths);
                setSelection(n.path);
            }
        });
    }
});
