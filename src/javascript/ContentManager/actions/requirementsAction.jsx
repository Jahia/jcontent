import {composeActions} from '@jahia/react-material';
import {withApolloAction} from './withApolloAction';
import {from, concat, of, combineLatest} from 'rxjs';
import {filter, map} from 'rxjs/operators';
import {ActionRequirementsQueryHandler} from '../ContentManager.gql-queries';
import * as _ from 'lodash';
import {reduxAction} from './reduxAction';

function evaluateVisibilityPaths(visible, visibilityPaths, nodePath) {
    for (let i = 0; i < visibilityPaths.length; i++) {
        if (new RegExp(visibilityPaths[i]).test(nodePath)) {
            return visible;
        }
    }
    return !visible;
}

function checkNodeRequirement(context, options) {
    context = {...context};
    let req = {...context, ...options};
    let {requiredPermission, showOnNodeTypes, hideOnNodeTypes, requireModuleInstalledOnSite, showForPaths, enabled, contentType, hideForPaths} = req;
    let requirementQueryHandler = new ActionRequirementsQueryHandler(req);
    if (requirementQueryHandler.requirementsFragments.length > 0) {
        let watchQuery = context.client.watchQuery({
            query: requirementQueryHandler.getQuery(),
            variables: requirementQueryHandler.getVariables()
        });

        context.requirementQueryHandler = requirementQueryHandler;

        context.node = from(watchQuery)
            .pipe(
                filter(res => (res.data && res.data.jcr && res.data.jcr.nodeByPath)),
                map(res => res.data.jcr.nodeByPath)
            );
        if (showForPaths || requiredPermission || showOnNodeTypes || hideOnNodeTypes || requireModuleInstalledOnSite || hideForPaths) {
            context.enabled = concat(of(false), context.node.pipe(map(node =>
                (_.isEmpty(showForPaths) || evaluateVisibilityPaths(true, showForPaths, node.path)) &&
                (_.isEmpty(requiredPermission) || node.hasPermission) &&
                (_.isEmpty(showOnNodeTypes) || node.isNodeType) &&
                (_.isEmpty(hideOnNodeTypes) || !node.isNotNodeType) &&
                (_.isEmpty(contentType) || node.allowedChildNodeTypes.length > 0) &&
                (_.isEmpty(requireModuleInstalledOnSite) || _.includes(node.site.installedModulesWithAllDependencies, requireModuleInstalledOnSite)) &&
                (_.isEmpty(hideForPaths) || evaluateVisibilityPaths(false, hideForPaths, node.path))
            )));
        }
        if (enabled) {
            if (context.enabled) {
                context.enabled = combineLatest(context.enabled, concat(of(false), enabled(context)))
                    .pipe(map(arr => arr[0] && arr[1]));
            } else {
                context.enabled = concat(of(false), enabled(context));
            }
        }
    } else {
        context.enabled = ((_.isEmpty(showForPaths) || evaluateVisibilityPaths(true, showForPaths, context.path)) &&
            (_.isEmpty(hideForPaths) || evaluateVisibilityPaths(false, hideForPaths, context.path)) &&
            (!enabled || enabled(context))
        );
    }
    return context;
}

let requirementsAction = composeActions(withApolloAction, reduxAction(state => ({language: state.language, uiLang: state.uiLang, site: state.site})), {
    init: context => {
        context.initRequirements = options => {
            if (context.path) {
                Object.assign(context, checkNodeRequirement(context, options));
            } else if (context.paths) {
                let {paths, ...remainingContext} = context;
                let contexts = paths.map(path => checkNodeRequirement({...remainingContext, path}, options));
                context.nodes = combineLatest(contexts.map(ctx => ctx.node));
                context.enabled = combineLatest(contexts.map(ctx => ctx.enabled)).pipe(map(enableds => enableds.reduce((acc, val) => acc && val, true)));
            }
        };
    }
});

export default requirementsAction;
