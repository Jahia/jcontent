import React from "react";
import {composeActions, withStylesAction} from "@jahia/react-material";
import {withApolloAction} from "./withApolloAction";
import {from, Subject, concat, of, combineLatest} from "rxjs";
import {filter, map, first} from 'rxjs/operators';
import {ActionRequirementsQueryHandler} from "../gqlQueries";
import * as _ from 'lodash';
import {reduxAction} from "./reduxAction";

function evaluateShowForPaths(paths, nodePath) {
    if (!paths) {
        return false;
    }
    for (let i = 0; i < paths.length; i++) {
        if (new RegExp(paths[i]).test(nodePath)) {
            return true;
        }
    }
    return false;
}

let requirementsAction = composeActions(withApolloAction, reduxAction((state) => ({language: state.language, uiLang: state.uiLang, site: state.site})), {
    init: (context) => {
        context.initRequirements = (options) => {
            let req = {...context, ...options};
            let {requiredPermission, showOnNodeTypes, hideOnNodeTypes, requireModuleInstalledOnSite, showForPaths, enabled, contentType} = req;
            let requirementQueryHandler = new ActionRequirementsQueryHandler(req);
            if (requirementQueryHandler.requirementsFragments.length > 0) {
                let watchQuery = context.client.watchQuery({
                    query: requirementQueryHandler.getQuery(),
                    variables: requirementQueryHandler.getVariables()
                });

                // console.log("watch", context)
                context.requirementQueryHandler = requirementQueryHandler;

                context.node = from(watchQuery)
                    .pipe(
                        filter(res => (res.data && res.data.jcr && res.data.jcr.nodeByPath)),
                        first(),
                        map(res => res.data.jcr.nodeByPath)
                    );
                if (showForPaths || requiredPermission || showOnNodeTypes || hideOnNodeTypes || requireModuleInstalledOnSite) {
                    context.enabled = concat(of(false), context.node.pipe(map(node =>
                        (_.isEmpty(showForPaths) || evaluateShowForPaths(showForPaths, node.path)) &&
                        (_.isEmpty(requiredPermission) || node.hasPermission) &&
                        (_.isEmpty(showOnNodeTypes) || node.isNodeType) &&
                        (_.isEmpty(hideOnNodeTypes) || !node.isNotNodeType) &&
                        (_.isEmpty(contentType) || node.allowedChildNodeTypes.length > 0) &&
                        (_.isEmpty(requireModuleInstalledOnSite) || _.includes(node.site.installedModulesWithAllDependencies, requireModuleInstalledOnSite))
                    )));
                }
                if (enabled) {
                    if (context.enabled) {
                        context.enabled = combineLatest(context.enabled, concat(of(false), enabled(context)))
                            .pipe(map(arr => arr[0] && arr[1]))
                    } else {
                        context.enabled = concat(of(false), enabled(context));
                    }
                }
            } else {
                context.enabled = _.isEmpty(showForPaths) || evaluateShowForPaths(showForPaths, node.path)
            }
        }
    }
});

export default requirementsAction;