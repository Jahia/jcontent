import React from "react";
import CmLeftDrawerContent from "../leftMenu/CmLeftDrawerContent";
import {composeActions} from "@jahia/react-material";
import requirementsAction from "./requirementsAction";

export default composeActions(requirementsAction, {
    onClick: (context) => {
        if (context.drawer.drawerOpen) {
            context.drawer.handleDrawerClose()
        } else {
            context.drawer.handleDrawerOpen({content: <CmLeftDrawerContent context={context} actionPath={context.actionKey}/>, title: context.buttonLabel}, context.menu)
        }
    },

    onDestroy:(context) => {
        context.drawer.openDrawerMenu === context.menu && context.drawer.handleDrawerClose();
    }

});
