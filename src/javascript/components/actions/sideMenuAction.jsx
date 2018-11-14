import React from "react";
import CmLeftDrawerContent from "../leftMenu/CmLeftDrawerContent";
import {composeActions} from "@jahia/react-material";
import requirementsAction from "./requirementsAction";
import {reduxAction} from "./reduxAction";

export default composeActions(requirementsAction, reduxAction((state) => ({path: state.path, mode: state.mode})), {
    init: (context) => {
        context.initRequirements();

        if (context.mode === 'apps' && !context.drawer.drawerOpen && context.path) {
            if (context.path.split('/')[0] === context.actionKey) {
                context.drawer.handleDrawerOpen({
                    content: <CmLeftDrawerContent context={context} actionPath={context.actionKey}/>,
                    title: context.buttonLabel
                }, context.menu)
            }
        }
    },

    onClick: (context) => {
        if (context.drawer.drawerOpen && context.drawer.openDrawerMenu === context.menu) {
            if (context.mode !== 'apps') {
                context.drawer.handleDrawerClose()
            }
        } else {
            context.drawer.handleDrawerOpen({content: <CmLeftDrawerContent context={context} actionPath={context.actionKey}/>, title: context.buttonLabel}, context.menu)
        }
    },

    onDestroy:(context) => {
        context.drawer.openDrawerMenu === context.menu && context.drawer.handleDrawerClose();
    }

});
