import React from "react";
import {map} from 'rxjs/operators';
import {composeActions} from "@jahia/react-material";
import requirementsAction from "./requirementsAction";
import {withDxContextAction} from "./withDxContextAction";

export default composeActions(requirementsAction, withDxContextAction, {
    init: (context) => {
        console.log(context);
        const siteContentPath = '/sites/' + context.dxContext.siteKey + '/contents';
        context.initRequirements({
            getDisplayableNodePath: true,
            enabled: context => {
                return context.node.pipe(map(node => {
                    console.log(node);
                    return !_.isEmpty(node.displayableNode) && node.displayableNode.path.indexOf(siteContentPath) === -1;
                }))
            }
        });
    },
    showOnNodeTypes: [ 'jnt:page', 'jmix:editorialContent' ],
    onClick: (context) => {
        window.open(context.dxContext.contextPath + '/cms/edit/default/' + context.dxContext.lang + context.node.displayableNode.path + '.html', '_blank')
    }
});
